import Link from "next/link";

const BOOKMARKLET_HREF = "javascript:!function()%7Bif(!location.hostname.includes(%22whatnot.com%22))return%20void%20alert(%22Open%20this%20on%20your%20Whatnot%20shop%20page%20first%2C%20then%20click%20the%20bookmarklet.%22)%3Bwindow.__wnSyncPanel%26%26(window.__wnSyncPanel.remove()%2Cwindow.__wnSyncPoll%26%26clearInterval(window.__wnSyncPoll))%3Bconst%20t%3Dnew%20Map%2Cn%3Dt%3D%3Enew%20Promise(n%3D%3EsetTimeout(n%2Ct))%2Ce%3Dt%3D%3E%5B...document.querySelectorAll(%22button%22)%5D.find(n%3D%3En.textContent.trim()%3D%3D%3Dt)%3Bfunction%20o()%7Bconst%20n%3Ddocument.querySelector(%22div.grid.grid-flow-row-dense%22)%3Bn%26%26(%5B...n.children%5D.forEach(n%3D%3E%7Bconst%20e%3Dfunction(t)%7Bif(t.classList.contains(%22cursor-wait%22))return%20null%3Bconst%20n%3Dt.querySelector('a%5Bhref*%3D%22%2Flisting%2F%22%5D')%3Bif(!n)return%20null%3Bconst%20e%3Dn.getAttribute(%22href%22).split(%22%2F%22).pop()%2Co%3Dt.querySelectorAll(%22strong%22)%3Bif(o.length%3C2)return%20null%3Bconst%20r%3Do%5B0%5D.textContent.trim()%2Ci%3DparseFloat(o%5B1%5D.textContent.trim().replace(%2F%5E%5C%24%2F%2C%22%22))%3Bif(!r%7C%7C!isFinite(i))return%20null%3Blet%20l%3Dnull%3Bif(o.length%3E%3D3)%7Bconst%20t%3Do%5B2%5D.textContent.match(%2F(%5Cd%2B)%2F)%3Bt%26%26(l%3DparseInt(t%5B1%5D%2C10))%7Dconst%20c%3Dt.querySelector(%22img%22)%2Cs%3Dc%26%26(c.currentSrc%7C%7Cc.src)%7C%7C%22%22%3Breturn%7BwhatnotId%3Ae%2Cname%3Ar%2CpriceDollars%3AString(i)%2Cqty%3Al%2Cimage%3As%7D%7D(n)%3Be%26%26!t.has(e.whatnotId)%26%26t.set(e.whatnotId%2Ce)%7D)%2Cl.textContent%3DString(t.size)%2Ct.size%3E0%26%26(c.disabled%3D!1%2Cc.style.cursor%3D%22pointer%22%2Cc.style.background%3D%22linear-gradient(135deg%2C%23fb923c%2C%23f472b6)%22))%7Dconst%20r%3Ddocument.createElement(%22div%22)%3Bwindow.__wnSyncPanel%3Dr%2Cr.style.cssText%3D%22position%3Afixed%3Bbottom%3A20px%3Bright%3A20px%3Bz-index%3A999999%3Bbackground%3A%230d0d14%3Bcolor%3A%23f0f0ff%3Bfont-family%3Asystem-ui%2Csans-serif%3Bborder%3A1px%20solid%20%232a2a3e%3Bborder-radius%3A12px%3Bpadding%3A16px%3Bwidth%3A280px%3Bbox-shadow%3A0%208px%2030px%20rgba(0%2C0%2C0%2C0.5)%3B%22%2Cr.innerHTML%3D'%3Cdiv%20style%3D%22font-weight%3A700%3Bmargin-bottom%3A6px%3B%22%3EWhatnot%20Sync%3C%2Fdiv%3E%3Cdiv%20id%3D%22wn-status%22%20style%3D%22font-size%3A13px%3Bcolor%3A%238888aa%3Bmargin-bottom%3A10px%3B%22%3EApplying%20Buy%20It%20Now%20filter%E2%80%A6%3C%2Fdiv%3E%3Cdiv%20style%3D%22font-size%3A13px%3Bmargin-bottom%3A12px%3B%22%3EItems%20found%3A%20%3Cstrong%20id%3D%22wn-count%22%3E0%3C%2Fstrong%3E%3C%2Fdiv%3E%3Cbutton%20id%3D%22wn-send%22%20disabled%20style%3D%22width%3A100%25%3Bpadding%3A8px%3Bborder%3Anone%3Bborder-radius%3A8px%3Bbackground%3A%23444%3Bcolor%3A%23fff%3Bfont-weight%3A600%3Bcursor%3Anot-allowed%3Bmargin-bottom%3A6px%3B%22%3ESend%20to%20Admin%20Dashboard%3C%2Fbutton%3E%3Cbutton%20id%3D%22wn-close%22%20style%3D%22width%3A100%25%3Bpadding%3A6px%3Bborder%3Anone%3Bborder-radius%3A8px%3Bbackground%3Atransparent%3Bcolor%3A%238888aa%3Bcursor%3Apointer%3Bfont-size%3A12px%3B%22%3EClose%3C%2Fbutton%3E'%2Cdocument.body.appendChild(r)%3Bconst%20i%3Dr.querySelector(%22%23wn-status%22)%2Cl%3Dr.querySelector(%22%23wn-count%22)%2Cc%3Dr.querySelector(%22%23wn-send%22)%3Br.querySelector(%22%23wn-close%22).onclick%3D()%3D%3E%7Bwindow.__wnSyncPoll%26%26clearInterval(window.__wnSyncPoll)%2Cr.remove()%7D%2Cc.onclick%3D()%3D%3E%7Bwindow.opener%3F(window.opener.postMessage(%7Btype%3A%22whatnot-sync-result%22%2Citems%3A%5B...t.values()%5D%7D%2C%22*%22)%2Ci.textContent%3D%22Sent%20%22%2Bt.size%2B%22%20items%20to%20the%20admin%20dashboard.%22)%3Ai.textContent%3D%22No%20admin%20tab%20found%20%E2%80%94%20reopen%20this%20from%20the%20Sync%20with%20Whatnot%20page.%22%7D%2Casync%20function()%7Bawait%20async%20function()%7Bconst%20t%3De(%22Sort%20By%22)%3Bif(!t)return!1%3Blet%20o%3Dt.parentElement%3Bfor(let%20t%3D0%3Bt%3C4%26%26o%26%26!(o.querySelectorAll(%22button%22).length%3E%3D2)%3Bt%2B%2B)o%3Do.parentElement%3Bif(!o)return!1%3Bconst%20r%3D%5B...o.querySelectorAll(%22button%22)%5D.find(t%3D%3E%22%22%3D%3D%3Dt.textContent.trim())%3Bif(!r)return!1%3Br.click()%2Cawait%20n(500)%3Bconst%20i%3De(%22Buy%20Format%22)%3Bif(!i)return!1%3Bi.click()%2Cawait%20n(400)%3Bconst%20l%3D%5B...document.querySelectorAll(%22label%22)%5D.find(t%3D%3Et.textContent.includes(%22Buy%20It%20Now%22))%3Bif(!l)return!1%3Bconst%20c%3Dl.querySelector(%22input%22)%3Bc%26%26!c.checked%26%26c.click()%2Cawait%20n(300)%3Bconst%20s%3De(%22Show%20Results%22)%3Breturn%20s%26%26s.click()%2Cawait%20n(1200)%2C!0%7D()%2Co()%2Ci.textContent%3D%22Scroll%20down%20through%20your%20shop%20%E2%80%94%20collecting%20items%20as%20they%20load.%20Click%20Send%20when%20done.%22%2Cwindow.__wnSyncPoll%3DsetInterval(o%2C900)%7D()%7D()%3B";

export default function WhatnotSyncInstallPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">Install the Whatnot Sync bookmarklet</h1>
      <p className="text-sm mb-8" style={{ color: "#8888aa" }}>
        This only needs to be done once per browser. The bookmarklet reads your Buy It Now
        listings straight out of the Whatnot shop page — nothing is installed as an extension,
        and nothing leaves your browser except when you click &quot;Send&quot;.
      </p>

      <div className="rounded-xl p-6 mb-6" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
        <ol className="space-y-4 text-sm" style={{ color: "#8888aa" }}>
          <li>
            <span className="text-[#f0f0ff] font-semibold">1.</span> Make sure your browser&apos;s
            bookmarks bar is visible (in most browsers: <span className="text-[#f0f0ff]">Ctrl/Cmd + Shift + B</span>).
          </li>
          <li>
            <span className="text-[#f0f0ff] font-semibold">2.</span> Drag the button below up into your
            bookmarks bar.
          </li>
          <li>
            <span className="text-[#f0f0ff] font-semibold">3.</span> That&apos;s it — go back to the{" "}
            <Link href="/admin/whatnot-sync" className="text-[#a855f7] hover:underline">
              Sync with Whatnot
            </Link>{" "}
            page and click &quot;Start Sync.&quot;
          </li>
        </ol>

        <div className="mt-8 flex justify-center">
          <a
            href={BOOKMARKLET_HREF}
            onClick={(e) => e.preventDefault()}
            draggable
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-grab active:cursor-grabbing select-none"
            style={{ background: "linear-gradient(135deg, #fb923c 0%, #f472b6 100%)" }}
          >
            🦆 Whatnot Sync
          </a>
        </div>
        <p className="text-xs text-center mt-3" style={{ color: "#555570" }}>
          ↑ Drag this into your bookmarks bar. Clicking it here won&apos;t do anything.
        </p>
      </div>

      <p className="text-xs" style={{ color: "#555570" }}>
        If your browser hides bookmarklets or blocks javascript: links, you may need to add it
        manually: create a new bookmark, name it &quot;Whatnot Sync,&quot; and paste this page&apos;s
        link as the URL.
      </p>
    </div>
  );
}
