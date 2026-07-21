title = Send
importingFile = İçe aktarılıyor…
encryptingFile = Şifreleniyor…
decryptingFile = Şifre çözülüyor…
downloadCount = { $num } indirme
timespanHours =
    { $num ->
        [one] 1 saat
       *[other] { $num } saat
    }
copiedUrl = Kopyalandı!
unlockInputPlaceholder = Parola
unlockButtonLabel = Kilidi aç
downloadButtonLabel = İndir
downloadFinish = İndirme tamamlandı
fileSizeProgress = ({ $partialSize } / { $totalSize })
sendYourFilesLink = Send’i deneyin
errorPageHeader = Bir şeyler ters gitti!
fileTooBig = Dosyanız çok büyük. En fazla { $size } boyutunda olmalı.
linkExpiredAlt = Bağlantı zaman aşımına uğramış
notSupportedHeader = Tarayıcınız desteklenmiyor.
notSupportedLink = Tarayıcım neden desteklenmiyor?
deletePopupCancel = Vazgeç
deleteButtonHover = Sil
passwordTryAgain = Yanlış parola. Yeniden deneyin.
javascriptRequired = Send için JavaScript gerekir
whyJavascript = Send neden JavaScript kullanıyor?
enableJavascript = Lütfen JavaScript'i etkinleştirip yeniden deneyin.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours } sa { $minutes } dk
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes } dk
# A short status message shown when the user enters a long password
maxPasswordLength = Maksimum parola uzunluğu: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Basit ve gizli dosya paylaşımı
introDescription = { -send-brand } ile dosyalarınızı uçtan uca şifreleme ve otomatik olarak silinen bir bağlantıyla paylaşın. Böylece özel dosyalarınız güvenle saklanır, bir süre sonra kendi kendine silinir.
notifyUploadEncryptDone = Dosyanız şifrelendi ve gönderilmeye hazır
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = { $downloadCount } veya { $timespan } sonra silinecek
timespanMinutes =
    { $num ->
        [one] 1 dakika
       *[other] { $num } dakika
    }
timespanDays =
    { $num ->
        [one] 1 gün
       *[other] { $num } gün
    }
fileCount =
    { $num ->
        [one] 1 dosya
       *[other] { $num } dosya
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
fileSize = { $num } { $units }
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
totalSize = Toplam boyut: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Dosyanızı paylaşmak için bağlantıyı kopyalayın:
copyLinkButton = Bağlantıyı kopyala
downloadTitle = Dosyaları indir
downloadDescription = Bu dosya { -send-brand } üzerinden paylaşıldı. Uçtan uca şifreleme ve kendiliğinden silinen bağlantı koruması { -send-brand }’de.
trySendDescription = Basit ve güvenli dosya paylaşımı için { -send-brand }’i deneyin.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Bir kerede en fazla 1 dosya yükleyebilirsiniz.
       *[other] Bir kerede en fazla { $count } dosya yükleyebilirsiniz.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] En fazla 1 arşive izin veriliyor.
       *[other] En fazla { $count } arşive izin veriliyor.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days } g { $hours } sa { $minutes } dk
addFilesButton = Yüklenecek dosyaları seçin
uploadButton = Yükle
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Dosyaları sürükleyip bırakarak
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = veya buraya tıklayarak { $size }’ye kadar dosyalarınızı gönderebilirsiniz
addPassword = Parola koruması ekle
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = Tamam
downloadingTitle = İndiriliyor
noStreamsWarning = Bu tarayıcı bu kadar büyük bir dosyanın şifresini çözemeyebilir.
noStreamsOptionCopy = Bağlantıyı başka bir tarayıcıda açmak için kopyala
noStreamsOptionDownload = Bu tarayıcıyla devam edin
# the next line after the colon contains a file name
shareLinkDescription = Dosyanızın bağlantısını paylaşın:
shareLinkButton = Bağlantıyı paylaş
# $name is the name of the file
shareMessage = “{ $name }” dosyasını { -send-brand } ile indirin: basit ve güvenli dosya paylaşımı
trailheadPromo = Gizliliğinizi korumanın bir yolu var. Firefox’a katılın.
footerText = Mozilla veya Firefox ile bağlantılı değildir.
footerLinkDonate = Bağış yap
footerLinkCli = CLI
footerLinkDmca = DMCA
footerLinkSource = Kaynak kodu
