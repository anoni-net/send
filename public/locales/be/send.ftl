title = Send
importingFile = Імпартаванне...
encryptingFile = Зашыфроўка...
decryptingFile = Расшыфроўка...
downloadCount =
    { $num ->
        [one] { $num } сцягванне
        [few] { $num } сцягванні
       *[many] { $num } сцягванняў
    }
timespanHours =
    { $num ->
        [one] { $num } гадзіна
        [few] { $num } гадзіны
       *[many] { $num } гадзін
    }
copiedUrl = Скапіявана!
unlockInputPlaceholder = Пароль
unlockButtonLabel = Разблакаваць
downloadButtonLabel = Сцягнуць
downloadFinish = Сцягванне скончана
fileSizeProgress = ({ $partialSize } з { $totalSize })
sendYourFilesLink = Паспрабуйце Send
errorPageHeader = Нешта пайшло не так!
fileTooBig = Гэты файл надта вялікі. Ён мусіць быць меншым за { $size }
linkExpiredAlt = Тэрмін дзеяння спасылкі сышоў
notSupportedHeader = Ваш браўзер не падтрымліваецца.
notSupportedLink = Чаму мой браўзер не падтрымліваецца?
deletePopupCancel = Скасаваць
deleteButtonHover = Выдаліць
passwordTryAgain = Некарэктны пароль. Паспрабуйце зноў.
javascriptRequired = Для Send неабходны JavaScript
whyJavascript = Чаму для Send неабходны JavaScript?
enableJavascript = Калі ласка, уключыце JavaScript і паспрабуйце зноў.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours } г. { $minutes } хв.
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes } хв.
# A short status message shown when the user enters a long password
maxPasswordLength = Максімальная даўжыня пароля: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Просты і прыватны абмен файламі
introDescription = { -send-brand } дазваляе вам абменьвацца файламі са скразным шыфраваннем і спасылкамі з абмежаваным тэрмінам дзеяння. Такім чынам, вы можаце дзяліцца файламі прыватна і быць упэўненым, што яны не застануцца ў сеціве назаўжды.
notifyUploadEncryptDone = Ваш файл зашыфраваны і гатовы да адпраўкі
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Тэрмін дзеяння сыдзе праз { $downloadCount } або { $timespan }
timespanMinutes =
    { $num ->
        [one] { $num } хвіліна
        [few] { $num } хвіліны
       *[many] { $num } хвілін
    }
timespanDays =
    { $num ->
        [one] { $num } дзень
        [few] { $num } дні
       *[many] { $num } дзён
    }
fileCount =
    { $num ->
        [one] { $num } файл
        [few] { $num } файлы
       *[many] { $num } файлаў
    }
# byte abbreviation
bytes = Б
# kibibyte abbreviation
kb = КБ
# mebibyte abbreviation
mb = МБ
# gibibyte abbreviation
gb = ГБ
# localized number and byte abbreviation. example "2.5MB"
fileSize = { $num } { $units }
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
totalSize = Агульны памер: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Скапіруйце спасылку, каб падзяліцца сваім файлам:
copyLinkButton = Скапіраваць спасылку
downloadTitle = Сцягнуць файлы
downloadDescription = Гэтым файлам падзяліліся праз { -send-brand } са скразным шыфраваннем і спасылкай з абмежаваным тэрмінам дзеяння.
trySendDescription = Паспрабуйце { -send-brand } для простага і бяспечнага абмену файламі.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Толькі { $count } файл можна загрузіць за раз.
        [few] Толькі { $count } файлы можна загрузіць за раз.
       *[many] Толькі { $count } файлаў можна загрузіць за раз.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Толькі { $count } архіў дазволены.
        [few] Толькі { $count } архівы дазволены.
       *[many] Толькі { $count } архіваў дазволена.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days } д. { $hours } г. { $minutes } хв.
addFilesButton = Выберыце файлы для загрузкі
uploadButton = Загрузіць
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Перацягніце файлы сюды
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = або клікніце, каб адправіць да { $size }:
addPassword = Абараніць паролем
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = ОК
downloadingTitle = Сцягваецца
noStreamsWarning = Гэты браўзер не мае магчымасці расшыфраваць такі вялікі файл.
noStreamsOptionCopy = Скапіруйце спасылку, каб адкрыць у іншым браўзеры
noStreamsOptionDownload = Працягнуць з гэтым браўзерам
# the next line after the colon contains a file name
shareLinkDescription = Падзяліцеся спасылкай на свой файл:
shareLinkButton = Падзяліцца спасылкай
# $name is the name of the file
shareMessage = Сцягніце «{ $name }» з { -send-brand }: простага і бяспечнага файлаабменніка
trailheadPromo = Ёсць спосаб абараніць вашу прыватнасць. Далучайцеся да Firefox.
