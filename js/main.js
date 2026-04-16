/**
 * 0. Toggle Navbar
 * 1. FAQ  accordion
 * 2. Handle paste / clear button
 * 3. Validate URL input
 * 4. Handle form submit
 *
 */

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

const navbarBurgerElement = $(".navbar-burger");
const faqBtns = $$(".btn-accordion");
const pasteBtn = $(".button-paste");
const urlInputElement = $("#url");
const alertElement = $(".message");
const alertContentElement = $(".message-body");
const formElement = document.forms.namedItem("formurl");
const downloadsElement = $("#download");
const languageBtns = $$(".lang-item");
const loaderElement = $(".get-loader");
const closeStickyBtn = $("#sticky-close");
const adBoxes = $$(".ad-box");

const app = {
  config: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
  },
  handleEvents: function () {
    const _this = this;

    adBoxes.forEach(function (adBox) {
      const observer = new MutationObserver(function (mutations, observer) {
        if (adBox) {
          adBox.style.minHeight = "";
        }
      });
      observer.observe(adBox, {
        attributes: true,
        attributeFilter: ["style"],
      });
    });
    // 1. Form Submit
    formElement &&
      formElement.addEventListener(
        "submit",
        function (ev) {
          gtag("event", "click_get_video", {
            value_input: urlInputElement.value,
          });
          if (_this.validator()) {
            loaderElement.classList.add("is-active");
            var oData = new FormData(formElement);
            var oReq = new XMLHttpRequest();
            oReq.open("POST", "/abc2.php", true);
            oReq.onload = function (oEvent) {
              if (oReq.status == 200) {
                _this.insertAndExecute(
                  "js-result",
                  "<scri" +
                    "pt type='text/javascript'>" +
                    oReq.response +
                    "</scr" +
                    "ipt>"
                );
              } else {
                _this.showAlert(
                  "Error " + oReq.status + " something went wrong.",
                  "error_status" + oReq.status,
                  urlInputElement.value
                );
              }
            };
            oReq.send(oData);
          }
          ev.preventDefault();
        },
        false
      );

    languageBtns.forEach(function (langBtn) {
      langBtn.onclick = function (e) {
        _this.setConfig("hl", this.dataset.hl);
      };
    });

    // Toggle Navbar
    navbarBurgerElement.onclick = function (e) {
      navbarBurgerElement.classList.toggle("is-active");
      $("#snaptik-menu").classList.toggle("is-active");
    };

    // FAQ  accordion
    faqBtns.forEach((faq) => {
      faq.addEventListener("click", () => {
        var accContent = faq.nextElementSibling;
        if (faq.classList.contains("active")) {
          faq.classList.remove("active");
          accContent.style.maxHeight = null;
        } else {
          var accsIsOpen = $$(".btn-accordion.active");
          accsIsOpen.forEach((accIsOpen) => {
            accIsOpen.classList.remove("active");
            accIsOpen.nextElementSibling.style.maxHeight = null;
          });

          faq.classList.add("active");
          accContent.style.maxHeight = accContent.scrollHeight + "px";
        }
      });
    });

    // Handle paste / clear button
    pasteBtn &&
      pasteBtn.addEventListener("click", () => {
        // e.preventdefault
        if (pasteBtn.classList.contains("btn-clear")) {
          urlInputElement.value = "";
          if (navigator.clipboard) {
            pasteBtn.classList.remove("btn-clear");
            $(".button-paste span").innerText = jsLang.paste;
          }
        } else {
          if (navigator.clipboard) {
            navigator.clipboard.readText().then(function (e) {
              if (e != "") {
                urlInputElement.value = e;
                _this.showBtnClear();
              } else {
                _this.showAlert(jsLang.linkEmpty, "input_empty");
              }
            });
          }
        }
      });

    if (!navigator.clipboard) {
      pasteBtn.remove();
    }

    urlInputElement &&
      urlInputElement.addEventListener("keyup", function (e) {
        if (urlInputElement.value.length > 0) {
          _this.showBtnClear();
        }
        _this.hideAlert;
      });

    // Show install app on Android
    if (isAndroid() || isIOS()) {
      const btnInstallApp = $(".button-install");
      if (btnInstallApp) {
        btnInstallApp.style.display = "flex";
        if (isIOS()) {
          $(".button-install").href =
            "https://apps.apple.com/app/svideo/id6461307222";
          const labelInstall =
            $(".button-install").querySelector(".nav_install_label");
          if (labelInstall) {
            labelInstall.innerText = labelInstall.textContent + " - IOS";
          }
        }
        if (isAndroid()) {
          // if (btnInstallApp.dataset.lang == "vi") {
          //   btnInstallApp.removeAttribute("href");
          //   btnInstallApp.onclick = function () {
          //     console.log("Change modal");
          //     showModalApp();
          //   };
          // }
        }
      }
    }

    // handle Download
    if (downloadsElement) {
      downloadsElement.onclick = function (e) {
        const downloadBtn = e.target.closest(".download-file");

        if (downloadBtn) {
          if (downloadBtn.dataset.ad === "true") {
            var vignetteAds = document.querySelectorAll(
              'ins[data-vignette-loaded="true"]'
            );
            if (vignetteAds.length === 0) {
              if (isIOS()) {
                e.preventDefault();
              }
              e.stopPropagation();
              _this.openAdsModal();

              if (isIOS()) {
                setTimeout(function () {
                  if (downloadBtn.getAttribute("href") != null) {
                    window.location.href = downloadBtn.getAttribute("href");
                  } else {
                    gtag("event", "Error_Download_vignetteAds");
                  }
                }, 1000);
              }
            }
          }
          if (downloadBtn.dataset.event) {
            gtag("event", "click_download_file", {
              server_name: downloadBtn.dataset.event,
            });
          }
        }
        const renderBtn = e.target.closest(".btn-render");
        if (renderBtn) {
          startRender(renderBtn.dataset.token);
        }
        const btnDownloadHd = e.target.closest(".btn-download-hd");
        if (btnDownloadHd) {
          btnDownloadHd.classList.add("downloading");
          btnDownloadHd.disabled = true;
          (powerTag.Init = window.powerTag.Init || []).push(function () {
            powerAPITag.getRewardedAd("pw_16256");
          });
          const token = btnDownloadHd.dataset.tokenhd;
          const linkBackup = btnDownloadHd.dataset.backup;
          fetch(`${token}`)
            .then((response) => response.json())
            .then((res) => {
              if (!res.error) {
                hdDownloadInfo = { ...hdDownloadInfo, url: res.url };
                checkHdDownloadReady();
              } else {
                btnDownloadHd.classList.remove("downloading");
                btnDownloadHd.disabled = false;
                window.location.href = linkBackup;
                gtag("event", "error_getHD");
              }
            })
            .catch((error) => {
              btnDownloadHd.classList.remove("downloading");
              btnDownloadHd.disabled = false;
              window.location.href = linkBackup;
              gtag("event", "error_getHD_response");
            });

          if (btnDownloadHd.dataset.event) {
            gtag("event", "click_download_reward", {
              quality: "HD_reward",
            });
          }
        }
      };
    }
    // closeStickyBtn.onclick = function () {
    //   $("#ad-sticky").remove();
    // };
  },
  validator: function () {
    const link = urlInputElement.value;
    const regexLink = /https?:\/\/(?:[-\w]+\.)?[-\w]+(?:\.\w+)+\/?.*/;
    const regexLinkTiktok =
      /(https?:\/\/)(?:www\.)?(?:tiktok\.com|(?:[a-z]{2,3}\.)?douyin\.com|(?:[a-z]{1,3}\.)?xzcs3zlph\.com|(?:[a-z]{1,3}\.)?tiktok\.com)\/[^ ]*/;
    const isLink = link.match(regexLink);

    if (link === "") {
      this.showAlert(jsLang.linkEmpty, "link_empty");
      return false;
    }

    if (!isLink) {
      this.showAlert(jsLang.notUrl, "error_url", urlInputElement.value);
      return false;
    }

    if (this.showPartnerLink(link)) {
      return false;
    }

    // const linksTiktok = link.match(regexLinkTiktok);

    // if (!linksTiktok) {
    //     this.showAlert(jsLang.urlNotSupport, 'url_not_support', urlInputElement.value);
    //     return false;
    // }
    return true;
  },
  showPartnerLink: function (link) {
    // Instagram partners
    if (link.indexOf("instagram.com/") !== -1) {
      this.showAlert(
        decodeURIComponent(jsLang.partnerIg),
        "input_url_instagram",
        urlInputElement.value
      );
      return true;
    }
    // Facebook partners
    if (
      link.indexOf("facebook.com/") !== -1 ||
      link.indexOf("fb.com/") !== -1
    ) {
      this.showAlert(
        decodeURIComponent(jsLang.partnerFb),
        "input_url_facebook",
        urlInputElement.value
      );
      return true;
    }
    return false;
  },
  openAdsModal: function (htmlModal = "") {
    // $("#modal-vignette").classList.add("is-active");
    // var ads_modal = document.getElementById("modal-content");
    // if (htmlModal == "") {
    //   ads_modal.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2496545456108734" data-ad-slot="5058619510" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    //   (adsbygoogle = window.adsbygoogle || []).push({});
    // } else {
    //   ads_modal.style.minHeight = "unset";
    //   ads_modal.innerHTML = htmlModal;
    // }
  },
  hideAlert: function () {
    alertElement.classList.remove("show");
    alertContentElement.innerHTML = "";
  },
  showAlert: function (msg, eventName = null, valueInput = null) {
    loaderElement.classList.remove("is-active");
    alertElement.classList.add("show");
    alertContentElement.innerHTML = msg;
    setTimeout(function () {
      alertElement.classList.remove("show");
      alertContentElement.innerHTML = "";
    }, 3000);
    if (eventName) {
      gtag("event", "get_video_failure", {
        error_code: eventName,
        value_input: valueInput,
      });
    }
  },
  showBtnClear: function () {
    pasteBtn.classList.add("btn-clear");
    $(".button-paste span").innerText = jsLang.clear;
  },
  insertAndExecute: function (id, text) {
    domelement = document.getElementById(id);
    domelement.innerHTML = text;
    var scripts = [];

    ret = domelement.childNodes;
    for (var i = 0; ret[i]; i++) {
      if (
        scripts &&
        this.nodeName(ret[i], "script") &&
        (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript")
      ) {
        scripts.push(
          ret[i].parentNode ? ret[i].parentNode.removeChild(ret[i]) : ret[i]
        );
      }
    }

    for (script in scripts) {
      this.evalScript(scripts[script]);
    }
  },
  nodeName: function (el, name) {
    return el.nodeName && el.nodeName.toUpperCase() === name.toUpperCase();
  },
  evalScript: function (el) {
    data = el.text || el.textContent || el.innerHTML || "";
    var head =
        document.getElementsByTagName("head")[0] || document.documentElement,
      script = document.createElement("script");
    script.type = "text/javascript";
    script.appendChild(document.createTextNode(data));
    head.insertBefore(script, head.firstChild);
    head.removeChild(script);

    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
  start: function () {
    // DOM Event
    this.handleEvents();
  },
};

app.start();

// Modal ads
document.addEventListener("DOMContentLoaded", () => {
  function closeModal($el) {
    $el.classList.remove("is-active");

    var ads_modal = document.getElementById("modal-content");
    // set min height 280
    ads_modal.style.minHeight = "280px";
    ads_modal.innerHTML = "";
  }

  function closeAllModals() {
    (document.querySelectorAll(".modal") || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  (document.querySelectorAll(".modal-background, .modal-close") || []).forEach(
    ($close) => {
      const $target = $close.closest(".modal");

      $close.addEventListener("click", () => {
        closeModal($target);
      });
    }
  );

  document.addEventListener("keydown", (event) => {
    const e = event || window.event;
    if (e.keyCode === 27) {
      closeAllModals();
    }
  });
});
