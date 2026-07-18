title = Send
importingFile = กำลังนำเข้า…
encryptingFile = กำลังเข้ารหัส…
decryptingFile = กำลังถอดรหัส…
downloadCount =
    { $num ->
       *[other] { $num } การดาวน์โหลด
    }
timespanHours =
    { $num ->
       *[other] { $num } ชั่วโมง
    }
copiedUrl = คัดลอกแล้ว!
unlockInputPlaceholder = รหัสผ่าน
unlockButtonLabel = ปลดล็อก
downloadButtonLabel = ดาวน์โหลด
downloadFinish = การดาวน์โหลดเสร็จสมบูรณ์
fileSizeProgress = ({ $partialSize } จาก { $totalSize })
sendYourFilesLink = ลองใช้ Send
errorPageHeader = มีบางอย่างผิดพลาด!
fileTooBig = ไฟล์นั้นใหญ่เกินกว่าจะอัปโหลดได้ ไฟล์ที่จะอัปโหลดควรมีขนาดน้อยกว่า { $size }
linkExpiredAlt = ลิงก์หมดอายุแล้ว
notSupportedHeader = ไม่รองรับเบราว์เซอร์ของคุณ
notSupportedLink = ทำไมจึงไม่รองรับเบราว์เซอร์ของฉัน?
notSupportedOutdatedDetail = น่าเสียดายที่ Firefox รุ่นนี้ไม่สนับสนุนเทคโนโลยีเว็บที่ขับเคลื่อน Send คุณจะต้องอัปเดตเบราว์เซอร์ของคุณ
updateFirefox = อัปเดต Firefox
deletePopupCancel = ยกเลิก
deleteButtonHover = ลบ
passwordTryAgain = รหัสผ่านไม่ถูกต้อง ลองอีกครั้ง
javascriptRequired = Send จำเป็นต้องใช้ JavaScript
whyJavascript = ทำไม Send จึงจำเป็นต้องใช้ JavaScript?
enableJavascript = โปรดเปิดใช้งาน JavaScript แล้วลองอีกครั้ง
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours } ชม. { $minutes } นาที
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes } นาที
# A short status message shown when the user enters a long password
maxPasswordLength = ความยาวรหัสผ่านสูงสุด: { $length }
# A short status message shown when there was an error setting the password

## Send version 2 strings

-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = การแบ่งปันไฟล์ที่ง่ายและเป็นส่วนตัว
introDescription = { -send-brand } ให้คุณแบ่งปันไฟล์ด้วยการเข้ารหัสจากต้นทางถึงปลายทางและลิงก์ที่หมดอายุโดยอัตโนมัติ คุณจึงสามารถเก็บสิ่งที่คุณแบ่งปันไว้เป็นส่วนตัวและตรวจสอบให้แน่ใจว่าข้อมูลของคุณจะไม่ออนไลน์ตลอดไป
notifyUploadEncryptDone = ไฟล์ของคุณได้รับการเข้ารหัสและพร้อมส่ง
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = หมดอายุหลังจาก { $downloadCount } หรือ { $timespan }
timespanMinutes =
    { $num ->
       *[other] { $num } นาที
    }
timespanDays =
    { $num ->
       *[other] { $num } วัน
    }
fileCount =
    { $num ->
       *[other] { $num } ไฟล์
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
totalSize = ขนาดรวม: { $size }
# the next line after the colon contains a file name
copyLinkDescription = คัดลอกลิงก์เพื่อแบ่งปันไฟล์ของคุณ:
copyLinkButton = คัดลอกลิงก์
downloadTitle = ดาวน์โหลดไฟล์
downloadDescription = ไฟล์นี้ถูกแบ่งปันผ่าน { -send-brand } พร้อมการเข้ารหัสจากต้นทางถึงปลายทางและลิงก์ที่หมดอายุโดยอัตโนมัติ
trySendDescription = ลองใช้ { -send-brand } สำหรับการแบ่งปันไฟล์ที่ง่ายและปลอดภัย
# count will always be > 10
tooManyFiles =
    { $count ->
       *[other] สามารถอัปโหลดได้ครั้งละ { $count } ไฟล์เท่านั้น
    }
# count will always be > 10
tooManyArchives =
    { $count ->
       *[other] สามารถอัปโหลดไฟล์เก็บถาวรได้เพียง { $count } ไฟล์เท่านั้น
    }
expiredTitle = ลิงก์นี้หมดอายุแล้ว
notSupportedDescription = { -send-brand } จะไม่ทำงานกับเบราว์เซอร์นี้ { -send-short-brand } จะทำงานได้ดีที่สุดกับ { -firefox } รุ่นล่าสุด และจะทำงานกับเบราว์เซอร์ส่วนใหญ่ที่เป็นรุ่นปัจจุบัน
downloadFirefox = ดาวน์โหลด { -firefox }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days } วัน { $hours } ชม. { $minutes } นาที
addFilesButton = เลือกไฟล์ที่จะอัปโหลด
uploadButton = อัปโหลด
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = ลากแล้วปล่อยไฟล์
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = หรือคลิกเพื่อส่งได้ถึง { $size }
addPassword = ปกป้องด้วยรหัสผ่าน
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = ตกลง
downloadingTitle = กำลังดาวน์โหลด
noStreamsWarning = เบราว์เซอร์นี้อาจไม่สามารถถอดรหัสไฟล์ขนาดใหญ่เท่านี้ได้
noStreamsOptionCopy = คัดลอกลิงก์เพื่อเปิดในเบราว์เซอร์อื่น
noStreamsOptionFirefox = ลองเบราว์เซอร์โปรดของเรา
noStreamsOptionDownload = ดำเนินการต่อด้วยเบราว์เซอร์นี้
# the next line after the colon contains a file name
shareLinkDescription = แบ่งปันลิงก์ไปยังไฟล์ของคุณ:
shareLinkButton = แบ่งปันลิงก์
# $name is the name of the file
shareMessage = ดาวน์โหลด “{ $name }” ด้วย { -send-brand }: การแบ่งปันไฟล์ที่ง่ายและเป็นส่วนตัว
trailheadPromo = มีวิธีปกป้องความเป็นส่วนตัวของคุณ เข้าร่วม Firefox
