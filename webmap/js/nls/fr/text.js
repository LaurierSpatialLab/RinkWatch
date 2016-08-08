define({

	"language": "Français",

	"title": "RinkWatch",

	"signIn": {
		"idManager": "S'Il vous plait, connectez-vous à RinkWatch."
	},

	"legend": {
		"title": "Données de patinoire",
		"layers": {
			"0": "Toutes les patinoires",
			"1": "Patinoires patinables",
			"2": "Patinoires non-patinables",
			"3": "Ma Patinoire"
		}
	},

	"mouseOver": " Patinoire(s)",
	"status": "Chargement...",

	"menu": {
		"title": "Menu RinkWatch",
		"legend": "Légende"
	},
	"toolbar": {
		"buttons": {
			"userTools": "Boîte à Outil",
			"newReading": "Nouvelles infos sur la patinoire",
			"menuBtn": "&#9776; Menu",
			"menuBtnSmall": "&#9776;",
			"menuBtnTitle": "Montrer/Cacher le menu",
			"extentBtn": "Zoom précédent",
			"extentBtnTitle": "Revenir au zoom précédent",
			"basemapBtn": " Carte de base",
			"basemapBtnTitle": "Carte de base",
			"switchLocale": "English",
			"readingDropDown": "Infos sur la patinoire"
		},

		"userLog": {
			"signIn": "Connexion",
			"signOut": "Déconnexion",
			"register": "Inscription",
			"editReading": "Modifier les infos de la patinoire",
			"downloadData": "Télécharger mes données de patinoire"
		},
		"geocoder": {
			"placeholder": "Rechercher une adresse",
			"template": "Rechercher les résultats"
		}
	},

	"chart": {
		"noData": "Manque de données"
	},

	"reading": {
		"skateStatus": "Patinable? ",
		"skateIndex": "Notez votre patinoire: ",
		"maxChar": "Nombre de caractères maximale",
		"readingDesc": "Description (Optionel): ",
		"readingCalendar": "Date: ",
		"addPhoto": "Ajoutez une photo: ",
		"saveReading": "Enregistrer",
		"saveReadingBusy": "Enregistrement des informations...",
		"saveEdits": "Mise à jour",
		"saveEditsBusy": "Mise à jour des informations...",
		"cancelReading": "Annuler",
		"editSelect": "Selection de lecture:",
		"noReadings": "Vous n'avez pas enregistrer aucune information sur votre patinoire à ce jour. Appuyez sur le bouton 'Nouvelles infos sur la patinoire' dans la boîte à outil pour enregistrer de l'informations sur votre patinoire.",
		"noRinks": "Vous n'avez pas encore de patinoire sur la carte. Appuyez sur le bouton 'Ajoutez une patinoire' à partir de la section 'Ma Patinoire' du menu pour commencer!",
		"existingReading1": "Vous avez déjà entré des données pour les dates suivantes:",
		"existingReading2": "Pour modifier vos données, choisissez 'Modifier les infos de la patinoire' du menu déroulant.",
		"sameDates": "Vous pouvez seulement enregistrer de l’information sur votre patinoire une fois par jour. S’il-vous-plait, ajustez vos informations de façon à ce qu’il n’y ait qu’une données par jour.",
		"numberSelect": "Pour combien de jours aimeriez-vous entrer des données?",
		"readingSaved": "Information sur le patinage soumise.",
		"readingUpdated": "Information sur le patinage mise à jour."
	},

	"filter": {
		"viewRinksLabel": "Visualiser les patinoires:",
		"viewRinks": {
			"0": "Toutes les Patinoires",
			"1": "Patinable/ non-patinable"
		},
		"skateableFilter": "Patinoires patinables  ",
		"notSkateableFilter": "Patinoires non-patinables  ",
		"noReadingFilter": "Toutes les patinoires  ",
		"timeFilter": "Choisir une préiode de temps ",
		"startDateBox": "Mises à jour concernant l’état des patinoires de",
		"endDateBox": "À "
	},

	"skateStatus": {
		"0": "Non-Patinable",
		"1": "Patinable"
	},

	"skateIndex": {
		"null": "-- Qualité de la glace --",
		"0": "À peine patinable.",
		"1": "Juste OK. On aurrait pu patiner dessus toute la journée, mais la glace était molle et/ou rugueuse.",
		"2": "Bonne. Une journée de patinage typique d'hiver.",
		"3": "Très bonne. Une des meilleures journées de l'hiver!",
		"4": "Fantastique! La glace ne pourrait pas être plus belle!"
	},

	"register": {
		"dialog": {
			"title" : "Inscrivez-vous en tant que RinkWatcher",
			"description": "S'il-vous-plaît fournir l'information suivante. Avec ce compte, vous pourrez entrer de l'information sur la patinabilité sur votre patinoire et la visualisez en utilisant RinkWatch.",
			"userName": {
				"label": "Nom d'utilisateur:",
				"placeHolder": "Votre nom d'utilisateur",
				"invalidMessage": "Ceci n'est pas un nom valide."
			},
			"password": {
				"label": "Mot de passe:",
				"placeHolder": "Votre mot de passe",
				"invalidMessage": "Ceci n'est pas un mot de passe valide."
			},
			"confirm": {
				"label": "Confirmez le mote de passe:",
				"placeHolder": "Confirmez le mot de passe",
				"invalidMessage": "Ceci ne correspond pas à votre mot de passe."
			},
			"name": {
				"label": "Nom complet:",
				"placeHolder": "Votre nom complet",
				"invalidMessage": "Ceci n'est pas un nom valide."
			},
			"email": {
				"label": "Courriel:",
				"placeHolder": "Votre adresse courriel",
				"invalidMessage": "Ceci n'est pas une adresse courriel valide."
			},
			"busy": {
				"label": "Soumettre",
				"busyLabel": "Soumission des données..."
			},
			"cancel": {
				"label": "Annuler"
			}
		},
		"invalid": {
			"title": "S'il vous plait, complétez le formulaire",
			"content": "Les entrées suivante ne sont pas valide:",
			"userName": "Nom d'utilisateur",
			"password": "Mot de passe",
			"fullName": "Nom complet",
			"email": "Courriel"
		},
		"verify": {
			"dialog": {
				"title": "Vérifiez votre compte RinkWatch",
				"desc": "Un code de vérification vous a été envoyée par courriel. Ouvrez le courriel et entrez le code de vérification dans la boîte ci-dessous:",
				"code": "Code de vérification:",
				"verifyBtn": {
					"label": "Vérification",
					"busy": "Vérification du compte..."
				}
			},
			"titleCode": "Votre code de vérification n'est pas valide!",
			"contentCode": "Le code de vérification que vous avez entré est incorrecte. S'il vous plait entrez le code de vérification qui vous a été envoyé pas courriel à nouveau.",
			"titleName": "Ce nom d'utilisateur existe déjà!",
			"contentName": "Le nom d'utilisateur que vous avez entré existe déjà. S'il vous plait recommencer le processus d'inscription avec un nouveau nom d'utilisateur.",
			"validBtn": "OK"
		}
	},

	"visual": {
		"title": "Effets visuels",
		"heatmap": {
			"label": "Cartefroide", // Carte de chaleur..?
			"on": "Ouvrir Cartefroide",
			"off": "Fermer Cartefroide",
			"title": "Patinabilité de votre patinoire",
			"heatLocal": "Utiliser les données sur l’écran seulement "
		},
		"clustering": {
			"label": "Regroupement",
			"on": "Ouvrir le regroupement",
			"off": "Fermer le regroupement",
			"legend": {
				"title": "Regroupement de patinoires",
				"0": " 1 - 9 Patinoires",
				"1": " 10 - 24 Patinoires",
				"2": " 25 - 50 patinoires",
				"3": " Plus de 50 patinoires"
			}
		}
	},

	"popup": {
		"title": " Infos sur la patinoire",
		"name": "Nom: ",
		"description": "Description de la patinoire:",
		"lastReading": "Mise à jour la plus récente: ",
		"photo": "Photo: "
	},

	"rink": {
		"dialog": {
			"title": "Nouvelles infos sur la patinoire",
			"edittitle": "Ajoutez infos sur votre patinoire",
			"deletetitle": "Supprimer vos données",
			"areyousure": "Etes-vous sûr de vouloir supprimer votre patinoire?",
			"confirmDelete": "Vos données ont été supprimées. Vous pourriez avoir à rafraîchir la page pour la page de mise à jour.",
			"norinksmessage": "Vous n'avez présentement aucun patinoires.",
			"rinkName": "Nom de la patinoire:",
			"rinkDesc": "Donnée une brève description de votre patinoire:",
			"rinkPhoto": "Ajoutez une photo: ",
			"rinkEditPhoto": "Ajoutez une nouvelle photo: ",
			"errorName": "S'il vous plait spécifiez un nom pour identifier votre patinoire.",
			"errorRename": "Il y a déjà une patinoire sauvegarder avec ce nom. S'il vous plait, renommez votre patinoire.",
			"rinkCreate": {
				"label": "Créé",
				"busyLabel": "Création de la patinoire..."
			},
			"rinkEdit": {
				"label": "Modifier",
				"busyLabel": "modifier..."
			},
			"rinkDelete": {
				"label": "Supprimer",
				"busyLabel": "supprimer..."
			},
			"rinkCancel": {
				"label": "Annuler"
			}
		},
		"pane": {
			"title": "Mes patinoires",
			"curRink": "Patinoire Actuel:",
			"zoomToRink": "Zoom sur la patinoire",
			"noRinks": "-- Pas de patinoires --",
			"addRink": "Ajoutez une patinoire",
			"editRink": "Modifier votre patinoire",
			"deleteRink": "Supprimer votre patinoire",
			"stats": {
				"title": "Statistiques de la patinoire",
				"readings": "Nombre de lectures: ",
				"skateable": "% Patinabilité: ",
				"lastReading": "Mise à jour la plus récente: ",
				"na": "N/A"
			}
		},
		"confirm": {
			"0": "Non",
			"1": "Oui",
			"title": "Confirmer la nouvelle patinoire",
			"content": "Êtes-vous certains de vouloir ajouter une patinoire à votre compte?"
		}
	},

	"email": {
		"subject": "Confirmation du compte RinkWatch",
		"text": "Merci de vous avoir inscrit comme un RinkWatcher! S'il vous plait finalisez votre inscription en entrant le code de vérification suivant dans la fenêtre qui apparait à votre écran. nous sommes impatient de travailler avec vous, L'équipe RinkWatch!"
	}

});
