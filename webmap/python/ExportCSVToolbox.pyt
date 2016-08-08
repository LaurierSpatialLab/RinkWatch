import arcpy
import time
import zipfile
import csv
import sys
import locale

class Toolbox(object):
	def __init__(self):
		"""Define the toolbox (the name of the toolbox is the name of the
		.pyt file)."""
		self.label = "Toolbox"
		self.alias = ""

		# List of tool classes associated with this toolbox
		self.tools = [ExportCSV]

class ExportCSV(object):
	def __init__(self):
		"""Define the tool (tool name is the name of the class)."""
		self.label = "ExportCSV"
		self.description = ""
		self.canRunInBackground = False

	def getParameterInfo(self):

		param0 = arcpy.Parameter(
			displayName="Input Expression",
			name="in_features",
			datatype="SQL Expression",
			parameterType="Required",
			direction="Input")

		param2 = arcpy.Parameter(
			displayName="Language",
			name="language",
			datatype="String",
			parameterType="Required",
			direction="Input")

		param1 = arcpy.Parameter(
			displayName="Output ZIP",
			name="output",
			datatype="String",
			parameterType="Derived",
			direction="Output")

		params = [param0, param1, param2]

		return params

	def isLicensed(self):
		"""Set whether tool is licensed to execute."""
		return True

	def updateParameters(self, parameters):
		"""Modify the values and properties of parameters before internal
		validation is performed.  This method is called whenever a parameter
		has been changed."""
		return

	def updateMessages(self, parameters):
		"""Modify the messages created by internal validation for each tool
		parameter.  This method is called after internal validation."""
		return

	def execute(self, parameters, messages):

		arcpy.env.overwriteOutput = 1

		# Script arguments
		Expression = parameters[0].valueAsText
		timestamp = time.strftime('%Y_%m_%d_%H_%M_%S')
		parameters[1].value = timestamp + "_rinkData.zip"
		lang = parameters[2].value

		# ============= EDIT PATHS HERE ==================
		rw_output = "C:\\inetpub\\wwwroot\\webmap\\temp\\" + timestamp + "_rinkData.csv"
		readingsTable = "C:\\Users\\Haydn\\AppData\\Roaming\\ESRI\\Desktop10.2\\ArcCatalog\\rw.sde\\rinkwatch_reading_sde"
		# ================================================

		# Process: Export License Information to CSV
		arcpy.AddMessage("Exporting Rink Data to CSV...");
		writeToCSV(readingsTable, rw_output, Expression, lang)

		# Archive the CSV files in a ZIP file
		arcpy.AddMessage("Archiving CSVs to ZIP file");
		outputZip = zipfile.ZipFile("c://inetpub/wwwroot/webmap/temp/"+timestamp+"_rinkData.zip", "w")
		outputZip.write("c://inetpub/wwwroot/webmap/temp/"+timestamp+"_rinkData.csv", "rinkData.csv", zipfile.ZIP_DEFLATED)
		outputZip.close()

		return

def writeToCSV(tableName, outputCsv, scExp, lang):
	# Added in sort field which is specific to this db, will have to change in the future for other cases
	rows = arcpy.SearchCursor(tableName, scExp, sort_fields="reading_time D")
	csvFile = csv.writer(open(outputCsv, 'wb'))
	fieldnames = [f.name for f in arcpy.ListFields(tableName)]

	for i, f in enumerate(fieldnames):
		if f == "objectid":
			del fieldnames[i]

	if lang == "English":
		allRows = []
		for row in rows:
			rowlist = []
			for field in fieldnames:
				if field == 'reading_data':
					if row.getValue(field) == 1:
						rowlist.append('Patinable') # Patinable
					else:
						rowlist.append('Non-patinable') # Non-patinable
				elif field == 'reading_text':
					val = row.getValue(field)
					if isinstance(val, unicode):
						val = val.encode('utf8')
					rowlist.append(val)
				else:
					rowlist.append(row.getValue(field))
			allRows.append(rowlist)

		for i, f in enumerate(fieldnames):
			if f == 'reading_rink_id':
				fieldnames[i] = 'ID de la patinoire'
			elif f == 'reading_data':
				fieldnames[i] = 'Patinabilite' # Patinabilité
			elif f == 'reading_time':
				fieldnames[i] = 'Date'
			elif f == 'reading_text':
				fieldnames[i] = 'Description'
			elif f == 'skateable':
				fieldnames[i] = 'Qualite de la glace' # Qualité de la glace

	else:
		allRows = []
		for row in rows:
			rowlist = []
			for field in fieldnames:
				if field == 'reading_data':
					if row.getValue(field) == 1:
						rowlist.append('Skateable') # Patinable
					else:
						rowlist.append('Not Skateable') # Non-patinable
				elif field == 'reading_text':
					val = row.getValue(field)
					if isinstance(val, unicode):
						val = val.encode('utf8')
					rowlist.append(val)
					# rowlist.append(str(row.getValue(field)).decode('unicode_escape').encode('utf-8'))
				else:
					rowlist.append(row.getValue(field))
			allRows.append(rowlist)

		for i, f in enumerate(fieldnames):
			if f == 'reading_rink_id':
				fieldnames[i] = 'Rink ID' # ID de la patinoire
			elif f == 'reading_data':
				fieldnames[i] = 'Skateability' # Patinabilité
			elif f == 'reading_time':
				fieldnames[i] = 'Date'
			elif f == 'reading_text':
				fieldnames[i] = 'Description'
			elif f == 'skateable':
				fieldnames[i] = 'Ice Quality' # Qualité de la glace

	csvFile.writerow(fieldnames)
	for row in allRows:
		csvFile.writerow(row)
	return