<a id="en"></a>

# Send — anoni.net self-hosted source

**English** | [正體中文](#zh-tw)

This repository holds the source of [Send][upstream] that the [anoni.net][anoni]
community self-hosts at **https://send.anoni.net**. Send is a simple, private,
end-to-end encrypted file-sharing web app: files are encrypted in the browser
and the server only ever stores ciphertext, never the decryption key.

## Relationship to upstream

This is a **downstream copy, not a GitHub fork.** Send's canonical repository
lives on GitLab and is only mirrored to GitHub, so the GitHub fork network does
not apply here. We keep our own standalone repository instead:

- Upstream (maintained by Tim Visée): <https://gitlab.com/timvisee/send>
  (mirror: <https://github.com/timvisee/send>)
- Upstream is itself a community fork of Mozilla's discontinued
  [Firefox Send](https://github.com/mozilla/send).

This repository exists so the anoni.net community can pin, review, build and
modernize the exact code we run, with our own CI and signed images.

Since **v4.0.0** our version numbers no longer track upstream's. Upstream's last
release was v3.4.27, which is the commit this repository diverged from.

We are **not affiliated with, nor endorsed by, Mozilla or Tim Visée.** All
*Mozilla* and *Firefox* branding was already removed upstream so the project can
be self-hosted legally.

### Staying in sync with upstream

Upstream is tracked through a git remote named `upstream`:

```sh
git remote -v
# origin    https://github.com/anoni-net/send.git   (this repo)
# upstream  https://gitlab.com/timvisee/send.git     (canonical)

git fetch upstream
git merge upstream/master   # review, then push to origin/main
```

## What we changed

The full history was imported from upstream and preserved, including all tags.
Everything below was done on top of upstream v3.4.27. See
[CHANGELOG.md](CHANGELOG.md) for the detailed list.

- **Runtime and build stack modernized** — Node 16 to 22, webpack 4 to 5,
  node-redis 3 to 6, aws-sdk v2 to v3, `@google-cloud/storage` 6 to 7.
- **No third-party error reporting.** Sentry is gone from both the browser and
  the server, so nothing this service runs reports to anyone else.
- **Supply chain** — we build and publish our own multi-arch image to
  `ghcr.io/anoni-net/send`, signed with cosign (keyless, Sigstore), with an SBOM
  and SLSA provenance attached, and scanned with Trivy.
- **Tests** — backend, frontend (Playwright) and a headless browser check now
  run in CI, alongside a real end-to-end encrypted upload and download
  round-trip against a freshly built image.
- **No protocol or crypto changes.** The wire format, URL format and encryption
  are untouched, so existing links and third-party clients such as `ffsend`
  keep working.

Our **deployment configuration** (Docker Compose, nginx, hostnames) is kept
separately and is not part of this repository.

## Using our image

The image is public, so pulling needs no login:

```sh
docker pull ghcr.io/anoni-net/send:4.0.0
```

Every published image is signed by our CI. Verify it before you run it:

```sh
cosign verify ghcr.io/anoni-net/send:4.0.0 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/anoni-net/send/.github/workflows/publish.yml@.*$'
```

Pin by digest (`@sha256:...`) in production so the tag cannot move under you.

## Verifying what you are running

Send encrypts in the browser, so its protection rests on the JavaScript your
browser received being the JavaScript we published. That is checkable, and
[VERIFYING.md](VERIFYING.md) is the step-by-step:

- compare the bytes an instance served you against the `SHA256SUMS.txt` attached
  to the matching [release](https://github.com/anoni-net/send/releases), which
  comes from GitHub rather than from the server being checked,
- verify the image signature, SBOM and provenance with `cosign`,
- or rebuild from source and compare. Our builds are reproducible: the same
  commit produces byte-identical output across operating systems and Node
  versions.

## Upstream documentation

The original project README is preserved verbatim as
[README.upstream.md](README.upstream.md). Full docs live under [docs/](docs/):
[FAQ](docs/faq.md), [Encryption](docs/encryption.md), [Build](docs/build.md),
[Docker](docs/docker.md).

## License & attribution

Send is licensed under the [Mozilla Public License 2.0](LICENSE) (MPL-2.0), and
`qrcode.js` is licensed under MIT. This downstream copy keeps the same license,
unchanged. Copyright remains with Mozilla, Tim Visée and the Send contributors
listed in [CONTRIBUTORS](CONTRIBUTORS); anoni.net's own modifications are
released under the same MPL-2.0.

---

<a id="zh-tw"></a>

# Send：anoni.net 自架原始碼

[English](#en) | **正體中文**

這個 repository 存放 [anoni.net][anoni] 社群自架在 **https://send.anoni.net**
的 [Send][upstream] 原始碼。Send 是一個簡單、私密、端到端加密的檔案分享網頁
程式。檔案在瀏覽器裡就加密完成，伺服器只會拿到密文，永遠拿不到解密金鑰。

## 與上游的關係

這是一份 downstream 複本，並非 GitHub fork。Send 的正式 repository 在 GitLab，
GitHub 上那份只是鏡像，所以 GitHub 的 fork 網路在這裡不適用。我們維護自己的
獨立 repository：

- 上游（維護者 Tim Visée）：<https://gitlab.com/timvisee/send>
  （鏡像：<https://github.com/timvisee/send>）
- 上游本身是 Mozilla 已經停止營運的
  [Firefox Send](https://github.com/mozilla/send) 的社群 fork。

這個 repository 存在的理由，是讓 anoni.net 社群能夠固定版本、審閱、建置並持續
現代化我們實際在跑的那份程式碼，用我們自己的 CI 與簽章映像。

從 **v4.0.0** 起，我們的版號不再跟隨上游。上游最後一個發行版是 v3.4.27，也是
這個 repository 分岔出來的那個 commit。

我們與 Mozilla 或 Tim Visée 沒有從屬關係，也未獲得他們背書。所有 *Mozilla* 與
*Firefox* 的品牌標識在上游就已經移除，讓這個專案可以合法自架。

### 與上游保持同步

上游透過名為 `upstream` 的 git remote 追蹤：

```sh
git remote -v
# origin    https://github.com/anoni-net/send.git   （這個 repo）
# upstream  https://gitlab.com/timvisee/send.git     （正式來源）

git fetch upstream
git merge upstream/master   # 先審閱，再推到 origin/main
```

## 我們改了什麼

完整歷史從上游匯入並保留，包含所有 tag。以下的變更都是疊在上游 v3.4.27 之上。
詳細清單見 [CHANGELOG.md](CHANGELOG.md)。

- **執行環境與建置工具現代化**：Node 16 升到 22、webpack 4 升到 5、node-redis 3
  升到 6、aws-sdk v2 升到 v3、`@google-cloud/storage` 6 升到 7。
- **沒有第三方錯誤回報**。Sentry 已經從瀏覽器端與伺服器端一併移除，這個服務跑
  的東西不會向任何其他人回報。
- **供應鏈**：我們自己建置並發布多架構映像到 `ghcr.io/anoni-net/send`，用
  cosign 簽章（keyless、Sigstore），附上 SBOM 與 SLSA provenance，並經過 Trivy
  掃描。
- **測試**：後端測試、前端測試（Playwright）與 headless 瀏覽器檢查都在 CI 執行，
  另外對每次新建的映像跑一次真實的端到端加密上傳與下載往返。
- **沒有更動協定或加密**。傳輸格式、URL 格式與加密都沒有動過，所以既有的分享
  連結與 `ffsend` 這類第三方客戶端都能繼續使用。

我們的**部署設定**（Docker Compose、nginx、主機名稱）另外保管，不在這個
repository 裡。

## 使用我們的映像

映像是公開的，拉取不需要登入：

```sh
docker pull ghcr.io/anoni-net/send:4.0.0
```

每一個發布的映像都經過我們的 CI 簽章。執行之前先驗證：

```sh
cosign verify ghcr.io/anoni-net/send:4.0.0 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/anoni-net/send/.github/workflows/publish.yml@.*$'
```

正式環境請用 digest（`@sha256:...`）固定版本，這樣 tag 就不會在你不知情的情況下
被移動。

## 驗證你正在使用的東西

Send 在瀏覽器裡加密，所以它的保護建立在一件事上：你的瀏覽器收到的 JavaScript
就是我們發布的那一份。這件事可以查證，[VERIFYING.md](VERIFYING.md) 是逐步做法：

- 把某個實例送給你的位元組，跟對應
  [release](https://github.com/anoni-net/send/releases) 附的 `SHA256SUMS.txt`
  比對。那份檔案來自 GitHub，而非來自正在被檢查的那台伺服器。
- 用 `cosign` 驗證映像簽章、SBOM 與 provenance。
- 或者從原始碼重新建置再比對。我們的建置是可重現的：同一個 commit 在不同作業
  系統與不同 Node 版本下，產生位元一致的輸出。

## 上游文件

原始專案的 README 原封不動保留在
[README.upstream.md](README.upstream.md)。完整文件在 [docs/](docs/)：
[常見問題](docs/faq.md)、[加密說明](docs/encryption.md)、[建置](docs/build.md)、
[Docker](docs/docker.md)。

## 授權與致謝

Send 採用 [Mozilla Public License 2.0](LICENSE)（MPL-2.0），`qrcode.js` 採用
MIT。這份 downstream 複本沿用相同授權，未做更動。著作權仍屬於 Mozilla、Tim
Visée，以及 [CONTRIBUTORS](CONTRIBUTORS) 裡列出的 Send 貢獻者。anoni.net 自己的
修改同樣以 MPL-2.0 釋出。

[upstream]: https://gitlab.com/timvisee/send
[anoni]: https://anoni.net/
