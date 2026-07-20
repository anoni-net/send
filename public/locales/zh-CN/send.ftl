title = Send
importingFile = 正在导入…
encryptingFile = 正在加密…
decryptingFile = 正在解密…
downloadCount = { $num ->
        [one] 1 次下载
       *[other] { $num } 次下载
    }
timespanHours = { $num ->
        [one] 1 小时
       *[other] { $num } 小时
    }
copiedUrl = 已复制！
unlockInputPlaceholder = 密码
unlockButtonLabel = 解锁
downloadButtonLabel = 下载
downloadFinish = 下载完成
fileSizeProgress = ({ $partialSize } / { $totalSize })
sendYourFilesLink = 试试 Send
errorPageHeader = 我们遇到错误。
fileTooBig = 此文件太大。文件大小上限为 { $size }。
linkExpiredAlt = 链接已过期
notSupportedHeader = 不支持您的浏览器。
notSupportedLink = 为什么不支持我的浏览器？
deletePopupCancel = 取消
deleteButtonHover = 删除
footerText = 不附属于 Mozilla 或 Firefox。
footerLinkDonate = 捐助
footerLinkCli = 命令行
footerLinkDmca = DMCA
footerLinkSource = 源代码
passwordTryAgain = 密码不正确。请重试。
javascriptRequired = Send 需要 JavaScript
whyJavascript = 为什么 Send 需要 JavaScript？
enableJavascript = 请启用 JavaScript 并重试。
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours } 小时 { $minutes } 分钟
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes } 分钟
# A short status message shown when the user enters a long password
maxPasswordLength = 最大密码长度：{ $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = 简单、私密的文件分享服务
introDescription = 使用 { -send-brand } 端到端加密分享文件，链接到期即焚。分享更私密，文件到期真正无痕迹。
notifyUploadEncryptDone = 您的文件已加密，现在可以发送
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = { $downloadCount }或 { $timespan }后过期
timespanMinutes =
    { $num ->
        [one] 1 分钟
       *[other] { $num } 分钟
    }
timespanDays =
    { $num ->
        [one] 1 天
       *[other] { $num } 天
    }
fileCount =
    { $num ->
        [one] 1 个文件
       *[other] { $num } 个文件
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
totalSize = 总大小：{ $size }
# the next line after the colon contains a file name
copyLinkDescription = 复制链接以分享文件：
copyLinkButton = 复制链接
downloadTitle = 下载文件
downloadDescription = 此文件通过端到端加密的 { -send-brand } 与您分享，链接到期即焚。
trySendDescription = 试试 { -send-brand }，简单、私密的文件分享服务。
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] 一次只可上传 1 个文件。
       *[other] 一次只可上传 { $count } 个文件。
    }
# count will always be > 10
tooManyArchives =
    { $count ->
       *[other] 只可上传 { $count } 个压缩文件。
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days } 天 { $hours } 小时 { $minutes } 分钟
addFilesButton = 选择要上传的文件
uploadButton = 上传
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = 拖放文件
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = 或点此传送最大 { $size } 的文件
addPassword = 密码保护
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = 确定
downloadingTitle = 正在下载
noStreamsWarning = 此浏览器可能无法解密这么大的文件。
noStreamsOptionCopy = 复制链接以在其他浏览器中打开
noStreamsOptionDownload = 使用此浏览器继续
# the next line after the colon contains a file name
shareLinkDescription = 您的文件链接：
shareLinkButton = 分享链接
# $name is the name of the file
shareMessage = 使用 { -send-brand } 下载“{ $name }”：简单、安全的文件分享服务
# Shown when the upload connection could not be opened at all, which usually
# means something between the user and the server is blocking it.
connectFailed = 无法建立上传连接。你的网络可能拦截了它。请检查连接后重试。
# Shown when the server refuses a request because this connection has made too
# many in a short time.
rateLimited = 这个连接在短时间内发送了太多请求。请稍候再试。
# $seconds is how long the server asked us to wait
rateLimitedRetry = 这个连接在短时间内发送了太多请求。请在 { $seconds } 秒后重试。
# Shown when a share link no longer resolves. Replaces expiredTitle, which
# asserted a cause the server cannot know.
linkUnavailableTitle = 这个链接已经无法使用。可能是已经过期，也可能是已达下载次数上限。
# Replaces notSupportedDescription and notSupportedOutdatedDetail, which both
# named Firefox.
notSupportedDetail = 这个浏览器不支持 { -send-brand } 在浏览器内加密文件所需的网页技术。使用主流浏览器的当前版本即可。
notSupportedUpdateDetail = 你的浏览器版本不支持 { -send-brand } 所需的网页技术。更新浏览器通常就能解决。
# Shown when the site itself is not served over a secure origin.
insecureContextHeader = 这个网站没有以安全连接提供。
insecureContextDetail = 浏览器只在安全连接下开放 { -send-brand } 所需的加密功能。这个网站目前以纯 HTTP 提供，因此无法进行任何加密。这是网站的配置问题，不是你的浏览器有问题。
# Shown above the choices offered when a file is too large for this browser.
noStreamsChooseDescription = 请选择你要如何继续。
