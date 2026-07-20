title = Send
importingFile = ইম্পোর্ট হচ্ছে...
encryptingFile = ইনক্রিপট হচ্ছে...
decryptingFile = ডিক্রিপট হচ্ছে...
downloadCount =
    { $num ->
        [one] 1 ডাউনলোড
       *[other] { $num } ডাউনলোডগুলো
    }
timespanHours =
    { $num ->
        [one] 1 ঘন্টা
       *[other] { $num } ঘন্টা
    }
copiedUrl = কপি করা হয়েছে!
unlockInputPlaceholder = পাসওয়ার্ড
unlockButtonLabel = আনলক করুন
downloadButtonLabel = ডাউনলোড
downloadFinish = ডাউনলোড সম্পন্ন
fileSizeProgress = ({ $totalSize } এর { $partialSize })
sendYourFilesLink = Send পরখ করে দেখুন
errorPageHeader = কোন সমস্যা হয়েছে!
fileTooBig = ফাইলটি আপলোড করার জন্যে খুব বড়। এটি { $size } এর চেয়ে কম হওয়া উচিত।
linkExpiredAlt = লিঙ্ক মেয়াদউত্তীর্ণ হয়েছে
notSupportedHeader = আপনার ব্রাউজার সমর্থিত নয়।
notSupportedLink = আমার ব্রাউজার কেন সমর্থিত নয়?
deletePopupCancel = বাতিল
deleteButtonHover = মুছে ফেলুন
passwordTryAgain = ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।
javascriptRequired = Send এর জাভাস্ক্রিপ্ট প্রয়োজন।
whyJavascript = কেন Send এর জাভাস্ক্রিপ্ট প্রয়োজন?
enableJavascript = জাভাস্ক্রিপ্ট সক্রিয় করুন এবং আবার চেষ্টা করুন।
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }ঘ { $minutes }মি
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }মি
# A short status message shown when the user enters a long password
maxPasswordLength = সর্বোচ্চ পাসওয়ার্ড দৈর্ঘ্য:{ $length }


-send-brand = Send
-send-short-brand = প্রেরণ
-firefox = Firefox
-mozilla = Mozilla
introTitle = সহজ, ব্যক্তিগত ফাইল শেয়ার
introDescription = { -send-brand } ফাইল এনক্রিপশন ও স্বয়ংক্রিয়ভাবে মেয়াদ শেষ হবে এমন একটি লিঙ্কের মাধ্যমে শুরু-থেকে-শেষ পর্যন্ত শেয়ার করতে দেয়। একারণে আপনি যা শেয়ার করেন তা গোপন রাখতে এবং আপনার জিনিস চিরদিনের জন্য অনলাইনে থাকবে না তা নিশ্চিত করতে পারেন।
notifyUploadEncryptDone = আপনার ফাইল এনক্রিপ্ট করা হয়েছে এবং প্রেরণ করতে প্রস্তুত
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = { $downloadCount } বা { $timespan } পরে মেয়াদ শেষ হবে
timespanMinutes =
    { $num ->
        [one] ১ মিনিট
       *[other] { $num } মিনিট
    }
timespanDays =
    { $num ->
        [one] ১ দিন
       *[other] { $num } দিন
    }
fileCount =
    { $num ->
        [one] ১টি ফাইল
       *[other] { $num }টি ফাইল
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
totalSize = মোট আকার: { $size }
# the next line after the colon contains a file name
copyLinkDescription = আপনার ফাইল শেয়ার করতে লিঙ্ক অনুলিপি করুন:
copyLinkButton = লিঙ্ক অনুলিপি
downloadTitle = ফাইল ডাউনলোড
downloadDescription = ফাইলটি { -send-brand } এর মাধ্যমে এনক্রিপশন ও স্বয়ংক্রিয় মেয়াদ শেষ হবে এমন একটি লিঙ্কের মাধ্যমে শুরু-থেকে-শেষ পর্যন্ত শেয়ার করা হয়েছে।
trySendDescription = সহজ ও নিরাপদ ফাইল শেয়ারের জন্য { -send-brand } ব্যবহার করুন।
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] একবারে কেবল ১টি ফাইল আপলোড করা যাবে।
       *[other] একবারে কেবল { $count }টি ফাইল আপলোড করা যাবে।
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] কেবল ১টি আর্কাইভ অনুমোদিত।
       *[other] কেবল { $count } আর্কাইভ অনুমোদিত।
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }দি { $hours }ঘ { $minutes }মি
addFilesButton = আপলোডের জন্য ফাইল নির্বাচন করুন
uploadButton = আপলোড
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = ফাইল টেনে এনে ছাড়ুন
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = বা সর্বোচ্চ { $size } আকারের ফাইল পাঠাতে ক্লিক করুন
addPassword = পাসওয়ার্ড দ্বারা সুরক্ষিত রাখুন
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = ঠিক আছে
downloadingTitle = ডাউনলোড হচ্ছে
noStreamsWarning = এই ব্রাউজার এতো বড় একটি ফাইল ডিক্রিপ্ট করতে সক্ষম নয়।
noStreamsOptionCopy = অন্য ব্রাউজারে খুলতে লিঙ্ক অনুলিপি করুন
noStreamsOptionDownload = এই ব্রাউজার ব্যবহার অব্যহত রাখুন
# the next line after the colon contains a file name
shareLinkDescription = আপনার ফাইলে লিঙ্ক শেয়ার করুন:
shareLinkButton = লিঙ্ক শেয়ার করুন
# $name is the name of the file
shareMessage = { -send-brand } এর মাধ্যমে "{ $name }" ডাউনলোড করুন: সরল, নিরাপদ ফাইল শেয়ারিং
trailheadPromo = আপনার গোপনীয়তা রক্ষা করার একটি উপায় আছে। Firefox এ যোগ দিন।
