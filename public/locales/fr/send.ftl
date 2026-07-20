title = Send
importingFile = Importation…
encryptingFile = Chiffrement…
decryptingFile = Déchiffrement…
downloadCount =
    { $num ->
        [one] 1 téléchargement
       *[other] { $num } téléchargements
    }
timespanHours =
    { $num ->
        [one] 1 heure
       *[other] { $num } heures
    }
copiedUrl = Lien copié !
unlockInputPlaceholder = Mot de passe
unlockButtonLabel = Déverrouiller
downloadButtonLabel = Télécharger
downloadFinish = Téléchargement terminé
fileSizeProgress = ({ $partialSize } sur { $totalSize })
sendYourFilesLink = Essayer Send
errorPageHeader = Une erreur s’est produite.
fileTooBig = Ce fichier est trop volumineux pour être envoyé. Sa taille doit être inférieure à { $size }.
linkExpiredAlt = Le lien a expiré
notSupportedHeader = Votre navigateur n’est pas pris en charge.
notSupportedLink = Pourquoi mon navigateur n’est-il pas pris en charge ?
deletePopupCancel = Annuler
deleteButtonHover = Supprimer
passwordTryAgain = Mot de passe incorrect. Veuillez réessayer.
javascriptRequired = Send nécessite JavaScript
whyJavascript = Pourquoi Send nécessite-t-il JavaScript ?
enableJavascript = Veuillez activer JavaScript puis réessayer.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours } h { $minutes } min
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes } min
# A short status message shown when the user enters a long password
maxPasswordLength = Longueur maximale du mot de passe : { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Partage de fichiers simple et privé
introDescription = { -send-brand } vous permet de partager des fichiers chiffrés de bout en bout ainsi qu’un lien qui expire automatiquement. Ainsi, vous pouvez garder ce que vous partagez en privé et vous assurer que vos contenus ne restent pas en ligne pour toujours.
notifyUploadEncryptDone = Votre fichier est chiffré et prêt à l’envoi
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Expire après { $downloadCount } ou { $timespan }
timespanMinutes =
    { $num ->
        [one] 1 minute
       *[other] { $num } minutes
    }
timespanDays =
    { $num ->
        [one] 1 jour
       *[other] { $num } jours
    }
fileCount =
    { $num ->
        [one] 1 fichier
       *[other] { $num } fichiers
    }
# byte abbreviation
bytes = o
# kibibyte abbreviation
kb = Ko
# mebibyte abbreviation
mb = Mo
# gibibyte abbreviation
gb = Go
# localized number and byte abbreviation. example "2.5MB"
fileSize = { $num } { $units }
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
totalSize = Taille totale : { $size }
# the next line after the colon contains a file name
copyLinkDescription = Copiez le lien pour partager votre fichier :
copyLinkButton = Copier le lien
downloadTitle = Télécharger les fichiers
downloadDescription = Ce fichier a été partagé via { -send-brand } avec un chiffrement de bout en bout et un lien qui expire automatiquement.
trySendDescription = Essayez { -send-brand } pour un partage de fichiers simple et sécurisé.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Un seul fichier peut être envoyé à la fois.
       *[other] Seuls { $count } fichiers peuvent être envoyés à la fois.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Une seule archive est autorisée.
       *[other] Seules { $count } archives sont autorisées.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days } j { $hours } h { $minutes } min
addFilesButton = Sélectionnez des fichiers à envoyer
uploadButton = Envoyer
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Glissez-déposez des fichiers
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = ou cliquez pour envoyer jusqu’à { $size }
addPassword = Protéger par mot de passe
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = OK
downloadingTitle = Téléchargement en cours
noStreamsWarning = Ce navigateur pourrait ne pas être en mesure de déchiffrer un fichier aussi volumineux.
noStreamsOptionCopy = Copiez le lien pour l’ouvrir dans un autre navigateur
noStreamsOptionDownload = Continuer avec ce navigateur
# the next line after the colon contains a file name
shareLinkDescription = Partagez le lien vers votre fichier :
shareLinkButton = Partager le lien
# $name is the name of the file
shareMessage = Télécharger « { $name } » avec { -send-brand } : un moyen simple et sûr de partager des fichiers
trailheadPromo = Il existe un moyen de protéger votre vie privée. Rejoignez Firefox.
