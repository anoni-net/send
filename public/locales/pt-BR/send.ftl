title = Send
importingFile = Importando…
encryptingFile = Criptografando…
decryptingFile = Descriptografando…
downloadCount =
    { $num ->
        [one] baixar 1 vez
       *[other] baixar { $num } vezes
    }
timespanHours =
    { $num ->
        [one] 1 hora
       *[other] { $num } horas
    }
copiedUrl = Copiado!
unlockInputPlaceholder = Senha
unlockButtonLabel = Desbloquear
downloadButtonLabel = Baixar
downloadFinish = Download concluído
fileSizeProgress = ({ $partialSize } de { $totalSize })
sendYourFilesLink = Experimente o Send
errorPageHeader = Oops, ocorreu um erro!
fileTooBig = Esse arquivo ou grupo de arquivos é grande demais para ser enviado. Deve ser menor que { $size }.
linkExpiredAlt = Link expirado
notSupportedHeader = Seu navegador não é suportado.
notSupportedLink = Por que meu navegador não é suportado?
deletePopupCancel = Cancelar
deleteButtonHover = Remover da lista
passwordTryAgain = Senha incorreta. Tente novamente.
javascriptRequired = O Send requer JavaScript
whyJavascript = Por que o Send precisa do JavaScript?
enableJavascript = Ative o JavaScript e tente novamente.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }h { $minutes }min
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }min
# A short status message shown when the user enters a long password
maxPasswordLength = Tamanho máximo da senha: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Compartilhamento de arquivos fácil e privativo
introDescription = O { -send-brand } permite compartilhar arquivos com criptografia de ponta a ponta através de um link que expira automaticamente. Assim você pode proteger o que compartilha e ter certeza que suas coisas não ficarão online para sempre.
notifyUploadEncryptDone = Seu arquivo foi criptografado e está pronto para ser enviado
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Expira após { $downloadCount } ou { $timespan }
timespanMinutes =
    { $num ->
        [one] 1 minuto
       *[other] { $num } minutos
    }
timespanDays =
    { $num ->
        [one] 1 dia
       *[other] { $num } dias
    }
fileCount =
    { $num ->
        [one] 1 arquivo
       *[other] { $num } arquivos
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
totalSize = Tamanho total: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Copie o link para compartilhar seu arquivo:
copyLinkButton = Copiar link
downloadTitle = Baixar arquivos
downloadDescription = Este arquivo foi compartilhado via { -send-brand } com criptografia de ponta a ponta e um link que expira automaticamente.
trySendDescription = Experimente o { -send-brand } para compartilhar arquivos com simplicidade e segurança.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Somente 1 arquivo pode ser enviado por vez.
       *[other] Somente { $count } arquivos podem ser enviados por vez.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Só é permitido 1 pacote.
       *[other] Só são permitidos { $count } pacotes.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }d { $hours }h { $minutes }m
addFilesButton = Selecionar arquivos para enviar
uploadButton = Enviar
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Arraste e solte arquivos aqui
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = ou clique para enviar até { $size }
addPassword = Proteger com senha
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = OK
downloadingTitle = Baixando
noStreamsWarning = Este navegador pode não conseguir descriptografar um arquivo tão grande.
noStreamsOptionCopy = Copiar o link para abrir em outro navegador
noStreamsOptionDownload = Continuar com este navegador
# the next line after the colon contains a file name
shareLinkDescription = Compartilhe o link para o seu arquivo:
shareLinkButton = Compartilhar link
# $name is the name of the file
shareMessage = Baixe "{ $name }" com o { -send-brand }: compartilhamento de arquivos simples e seguro
trailheadPromo = Existe um meio de proteger sua privacidade. Use o Firefox.
footerText = Sem afiliação com a Mozilla ou o Firefox.
footerLinkDonate = Doar
footerLinkCli = CLI
footerLinkDmca = DMCA
footerLinkSource = Código-fonte
