title = Send
importingFile = Імпортуємо...
encryptingFile = Шифруємо...
decryptingFile = Розшифровуємо...
downloadCount =
    { $num ->
        [one] 1 завантаження
        [few] { $num } завантаження
       *[other] { $num } завантажень
    }
timespanHours =
    { $num ->
        [one] 1 година
        [few] { $num } години
       *[other] { $num } годин
    }
copiedUrl = Скопійовано!
unlockInputPlaceholder = Пароль
unlockButtonLabel = Розблокувати
downloadButtonLabel = Завантажити
downloadFinish = Завантаження завершено
fileSizeProgress = ({ $partialSize } з { $totalSize })
sendYourFilesLink = Спробуйте Send
errorPageHeader = Щось пішло не так!
fileTooBig = Цей файл завеликий для вивантаження. Він має бути меншим за { $size }.
linkExpiredAlt = Час дії посилання минув
notSupportedHeader = Ваш браузер не підтримується.
notSupportedLink = Чому мій браузер не підтримується?
deletePopupCancel = Скасувати
deleteButtonHover = Видалити
passwordTryAgain = Невірний пароль. Спробуйте знову.
javascriptRequired = Send потребує JavaScript
whyJavascript = Чому для Send потрібен JavaScript?
enableJavascript = Будь ласка, увімкніть JavaScript та спробуйте знову.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours } год. { $minutes } хв.
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes } хв.
# A short status message shown when the user enters a long password
maxPasswordLength = Найбільша довжина паролю: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Простий, приватний обмін файлами
introDescription = { -send-brand } дозволяє обмінюватися файлами з використанням наскрізного шифрування та посиланнями з обмеженим терміном дії. Отже, ви можете бути певними, що ваші дані зберігаються приватно і не залишаться в мережі назавжди.
notifyUploadEncryptDone = Ваш файл зашифрований і готовий до надсилання
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Термін зберігання завершується після { $downloadCount } або { $timespan }
timespanMinutes =
    { $num ->
        [one] 1 хвилина
        [few] { $num } хвилини
       *[other] { $num } хвилин
    }
timespanDays =
    { $num ->
        [one] 1 день
        [few] { $num } дні
       *[other] { $num } днів
    }
fileCount =
    { $num ->
        [one] 1 файл
        [few] { $num } файли
       *[other] { $num } файлів
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
fileSize = { $num }{ $units }
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
totalSize = Загальний розмір: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Скопіюйте посилання для спільного доступу:
copyLinkButton = Копіювати посилання
downloadTitle = Завантажити файли
downloadDescription = Цей файл було надіслано через { -send-brand } з використанням наскрізного шифрування і посиланням, що має обмежений термін дії.
trySendDescription = Спробуйте { -send-brand } для простого, захищеного обміну файлами.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Лише 1 файл можна вивантажити за один раз.
        [few] Лише { $count } файли можна вивантажити за один раз.
       *[other] Лише { $count } файлів можна вивантажити за один раз.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Дозволяється лише 1 архів.
        [few] Дозволяється лише { $count } архіви.
       *[other] Дозволяється лише { $count } архівів.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }д { $hours }г { $minutes }хв
addFilesButton = Оберіть файли для вивантаження
uploadButton = Вивантажити
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Перетягуйте файли
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = або натисніть, щоб надіслати до { $size }
addPassword = Захист паролем
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = Гаразд
downloadingTitle = Завантаження
noStreamsWarning = Цьому браузеру може не вдатися розшифрувати такий великий файл.
noStreamsOptionCopy = Скопіюйте посилання, щоб відкрити його в іншому браузері
noStreamsOptionDownload = Продовжити в цьому браузері
# the next line after the colon contains a file name
shareLinkDescription = Надішліть посилання на свій файл:
shareLinkButton = Поділитись посиланням
# $name is the name of the file
shareMessage = Завантажте “{ $name }” з { -send-brand }: простий та безпечний обмін файлами
trailheadPromo = Існує спосіб захистити вашу приватність. Приєднуйтесь до Firefox.
footerText = Не пов'язано з Mozilla чи Firefox.
footerLinkDonate = Підтримати
footerLinkCli = CLI
footerLinkDmca = DMCA
footerLinkSource = Джерельний код
