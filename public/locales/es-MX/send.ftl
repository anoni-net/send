title = Send
importingFile = Importando...
encryptingFile = Encriptando…
decryptingFile = Desencriptando…
downloadCount =
    { $num ->
        [one] 1 descarga
       *[other] { $num } descargas
    }
timespanHours =
    { $num ->
        [one] 1 hora
       *[other] { $num } horas
    }
copiedUrl = ¡Copiado!
unlockInputPlaceholder = Contraseña
unlockButtonLabel = Desbloquear
downloadButtonLabel = Descargar
downloadFinish = Descarga completa
fileSizeProgress = ({ $partialSize } de { $totalSize })
sendYourFilesLink = Prueba Send
errorPageHeader = ¡Algo salió mal!
fileTooBig = Ese archivo es muy grande. Debería ocupar menos de { $size }.
linkExpiredAlt = Enlace caducado
notSupportedHeader = Tu navegador no está soportado.
notSupportedLink = ¿Por qué mi navegador no tiene soporte?
deletePopupCancel = Cancelar
deleteButtonHover = Eliminar
passwordTryAgain = Contraseña incorrecta. Intenta de nuevo.
javascriptRequired = Send requiere JavaScript
whyJavascript = ¿Por qué Send requiere JavaScript?
enableJavascript = Por favor, habilita JavaScript e intenta de nuevo.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }h { $minutes }m
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }m
# A short status message shown when the user enters a long password
maxPasswordLength = Longitud máxima de la contraseña: { $length }


-send-brand = Send
-send-short-brand = Enviar
-firefox = Firefox
-mozilla = Mozilla
introTitle = Compartir archivos fácil y privado
introDescription = { -send-brand } te permite compartir archivos con cifrado de extremo a extremo y un enlace que caduca automáticamente. Así puedes mantener en privado lo que compartes y asegurarte de que tus cosas no permanezcan en línea para siempre.
notifyUploadEncryptDone = Tu archivo está cifrado y listo para enviar
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Expira después de { $downloadCount } o { $timespan }
timespanMinutes =
    { $num ->
        [one] 1 minuto
       *[other] { $num } minutos
    }
timespanDays =
    { $num ->
        [one] 1 día
       *[other] { $num } días
    }
fileCount =
    { $num ->
        [one] 1 archivo
       *[other] { $num } archivos
    }
# byte abbreviation
bytes = B
# kibibyte abbreviation
kb = KB
# mebibyte abbreviation
mb = MB
# gibibyte abbreviation
gb = GB
# localized number and byte abbreviation. example "2.5MB"
fileSize = { $num }{ $units }
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
totalSize = Tamaño total: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Copiar el enlace para compartir el archivo:
copyLinkButton = Copiar enlace
downloadTitle = Descargar archivos
downloadDescription = Este archivo fue compartido vía { -send-brand } con un cifrado de punto a punto y un enlace que expira automáticamente.
trySendDescription = Intenta con { -send-brand } para compartir fácil y seguro.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Solo 1 archivo puede ser cargado a la vez.
       *[other] Solo { $count } archivos pueden ser cargados a la vez.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Solo 1 archivo está permitido.
       *[other] Solo { $count } archivos están permitidos.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }d { $hours }h { $minutes }m
addFilesButton = Seleccionar archivos para subir
uploadButton = Subir
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Arrastrar y soltar archivos
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = o hacer clic para enviar hasta { $size }
addPassword = Protegido con contraseña
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = Aceptar
downloadingTitle = Descargando
noStreamsWarning = Puede que este navegador no pueda descifrar un archivo tan grande.
noStreamsOptionCopy = Copiar el enlace para abrir en otro navegador
noStreamsOptionDownload = Continuar con este navegador
# the next line after the colon contains a file name
shareLinkDescription = Comparte el enlace a tu archivo:
shareLinkButton = Enlace para compartir
# $name is the name of the file
shareMessage = Descarga «{ $name }» con { -send-brand }: es sencillo y seguro
trailheadPromo = Existe una forma de proteger tu privacidad. Únete a Firefox.
footerText = Sin afiliación con Mozilla o Firefox.
footerLinkDonate = Donar
footerLinkCli = CLI
footerLinkDmca = DMCA
footerLinkSource = Código fuente
