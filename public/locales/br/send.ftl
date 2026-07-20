title = Send
importingFile = Oc'h enporzhiañ …
encryptingFile = Oc'h enrinegañ..
decryptingFile = Oc'h ezrinegañ...
downloadCount =
    { $num ->
        [one] { $num } bellgargadenn
        [two] { $num } bellgargadenn
        [few] { $num } fellgargadenn
        [many] { $num } a bellgargadennoù
       *[other] { $num } pellgargadenn
    }
timespanHours =
    { $num ->
        [one] { $num } eur
        [two] { $num } eur
        [few] { $num } eur
        [many] { $num } a eurioù
       *[other] { $num } eur
    }
copiedUrl = Eilet!
unlockInputPlaceholder = Ger-tremen
unlockButtonLabel = Dibrennañ
downloadButtonLabel = Pellgargañ
downloadFinish = Pellgargadur echu
fileSizeProgress = ({ $partialSize } war { $totalSize })
sendYourFilesLink = Esaeit Send
errorPageHeader = Degouezhet ez eus bet ur fazi!
fileTooBig = Re vras eo ar restr-mañ evit e pellgas. Rankout a ra bezañ nebeutoc'h eget { $size }
linkExpiredAlt = Ere diamzeret
notSupportedHeader = N'eo ket skoret ho merdeer.
notSupportedLink = Perak n'eo ket skoret ma merdeer?
deletePopupCancel = Nullañ
deleteButtonHover = Dilemel
passwordTryAgain = Ger-tremen direizh. Klaskit en-dro.
javascriptRequired = Send a azgoulenn Javascript
whyJavascript = Perak e azgoulenn Send Javascript?
enableJavascript = Gweredekait Javascript ha klaskit en-dro.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }e { $minutes }m
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }m
# A short status message shown when the user enters a long password
maxPasswordLength = Hirder brasañ aotreet evit ar ger-tremen: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Rannañ restroù en un doare eeun ha prevez
introDescription = A-drugarez da { -send-brand } a c'hallit rannañ restroù gant un enrinegañ penn-ouzh-penn hag un ere a ziamzero ent emgefreek. Evel-se e c'hallit mirout ar pezh a rannit prevez ha bezañ sur ne chomo ket ho traoù enlinenn da viken.
notifyUploadEncryptDone = Enrineget eo ho restr ha prest eo da vezañ kaset
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Diamzeriñ a raio goude { $downloadCount } pe { $timespan }
timespanMinutes =
    { $num ->
        [one] { $num } vunutenn
        [two] { $num } vunutenn
        [few] { $num } munutenn
        [many] { $num } a vunutennoù
       *[other] { $num } munutenn
    }
timespanDays =
    { $num ->
        [one] { $num } devezh
        [two] { $num } zevezh
        [few] { $num } devezh
        [many] { $num } a zevezhioù
       *[other] { $num } devezh
    }
fileCount =
    { $num ->
        [one] { $num } restr
        [two] { $num } restr
        [few] { $num } restr
        [many] { $num } a restroù
       *[other] { $num } restr
    }
# byte abbreviation
bytes = e
# kibibyte abbreviation
kb = Ke
# mebibyte abbreviation
mb = Me
# gibibyte abbreviation
gb = Ge
# localized number and byte abbreviation. example "2.5MB"
fileSize = { $num }{ $units }
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
totalSize = Ment hollek: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Eilit an ere evit rannañ ho restr
copyLinkButton = Eilañ an ere
downloadTitle = Pellgargañ ar restroù
downloadDescription = Dre { -send-brand } eo bet rannet ar restr-mañ, gant un enrinegañ penn-ouzh-penn hag un ere a ziamzer ent emgefreek.
trySendDescription = Esaeit { -send-brand } evit rannañ restroù en un doare eeun ha prevez.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] N'haller pellgas nemet { $count } restr er memes mare.
        [two] N'haller pellgas nemet { $count } restr er memes mare.
        [few] N'haller pellgas nemet { $count } restr er memes mare.
        [many] N'haller pellgas nemet { $count } a restroù er memes mare.
       *[other] N'haller pellgas nemet { $count } restr er memes mare.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Aotreet eo{ $count } diell nemetken.
        [two] Aotreet eo{ $count } ziell nemetken.
        [few] Aotreet eo{ $count } diell nemetken.
        [many] Aotreet eo{ $count } a zielloù nemetken.
       *[other] Aotreet eo{ $count } diell nemetken.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }d { $hours }e { $minutes }m
addFilesButton = Diuzit ur restr da bellgas
uploadButton = Pellgas
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Riklit ha laoskit restroù
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = pe klikit evit kas betek { $size }
addPassword = Gwareziñ gant ur ger-tremen
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = Mat eo
downloadingTitle = O pellgargañ
noStreamsWarning = Posupl eo ne vefe ket gouest ar merdeer-mañ da ezrinegañ ur restr ken bras.
noStreamsOptionCopy = Eilit an ere evit digeriñ anezhañ en ur merdeer all
noStreamsOptionDownload = Kenderc'hel gant ar merdeer-mañ
# the next line after the colon contains a file name
shareLinkDescription = Rannit an ere etrezek ho restr:
shareLinkButton = Rannañ an ere
# $name is the name of the file
shareMessage = Pellgargañ "{ $name }" gant { -send-brand }: rannañ restroù en un doare eeun ha prevez
trailheadPromo = Un doare a zo da wareziñ ho puhez prevez. Tremenit da Firefox.
