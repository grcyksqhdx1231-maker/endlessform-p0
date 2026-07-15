(() => {
  const root = document.querySelector("#app");
  if (!root) return;

  const pinkModelUrl = "/models/chair-model-12.glb";
  let panel;
  let messages;
  let input;
  let timeline;
  let isOpen = false;

  const gsap = () => window.__P0_GSAP__;

  function updateScrollbar() {
    if (!panel || !messages) return;
    const track = panel.querySelector(".codex-ai-scrollbar");
    const thumb = panel.querySelector(".codex-ai-scrollbar span");
    if (!track || !thumb) return;
    const maxScroll = Math.max(0, messages.scrollHeight - messages.clientHeight);
    const ratio = maxScroll > 0 ? messages.clientHeight / messages.scrollHeight : 1;
    const thumbHeight = Math.max(30, Math.round(track.clientHeight * Math.min(1, ratio)));
    const travel = Math.max(0, track.clientHeight - thumbHeight);
    const y = maxScroll > 0 ? (messages.scrollTop / maxScroll) * travel : 0;
    panel.dataset.scrollable = maxScroll > 2 ? "true" : "false";
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${y}px)`;
  }

  function scrollMessagesToBottom(delay = 0) {
    if (!messages) return;
    const g = gsap();
    window.requestAnimationFrame(() => {
      const target = messages.scrollHeight;
      if (g) {
        g.killTweensOf(messages);
        g.to(messages, {
          scrollTop: target,
          duration: 0.42,
          delay,
          ease: "power2.out",
          onUpdate: updateScrollbar,
          onComplete: updateScrollbar,
        });
      } else {
        messages.scrollTop = target;
        updateScrollbar();
      }
    });
  }

  function aiNavButton() {
    return root.querySelector('.bottom-nav [data-nav="ai"], .page-bottom-nav [data-action="ai"]');
  }

  function setAiButtonActive(active) {
    const g = gsap();
    const button = aiNavButton();
    if (!g || !button) return;
    g.killTweensOf(button);
    if (active) {
      g.fromTo(
        button,
        { scale: 0.96 },
        { scale: 1, duration: 0.34, ease: "back.out(2.2)" },
      );
    } else {
      g.to(button, { scale: 1, duration: 0.22, ease: "power2.out" });
    }
  }

  function tweenIn(element, delay = 0) {
    const g = gsap();
    element.classList.add("is-visible");
    if (g) {
      g.fromTo(
        element,
        { y: 22, opacity: 0, scale: 0.985 },
        { y: 0, opacity: 1, scale: 1, duration: 0.56, delay, ease: "power3.out" },
      );
    }
    scrollMessagesToBottom(delay + 0.08);
  }

  function makeBubble(type, html) {
    const bubble = document.createElement("div");
    bubble.className = `codex-ai-bubble ${type}`;
    bubble.innerHTML = html;
    messages.append(bubble);
    updateScrollbar();
    return bubble;
  }

  function ensurePanel() {
    if (panel) return panel;

    panel = document.createElement("section");
    panel.className = "codex-ai-chat-panel";
    panel.setAttribute("aria-label", "AI 对话");
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `
      <div class="codex-ai-chat-messages" aria-live="polite"></div>
      <form class="codex-ai-inputbar">
        <input type="text" autocomplete="off" placeholder="发送一句请求" aria-label="发送一句请求" />
        <button class="codex-ai-send" type="submit" aria-label="发送">↑</button>
      </form>
      <div class="codex-ai-scrollbar" aria-hidden="true"><span></span></div>
    `;
    root.append(panel);
    messages = panel.querySelector(".codex-ai-chat-messages");
    input = panel.querySelector("input");
    messages.addEventListener("scroll", updateScrollbar, { passive: true });

    panel.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      submitRequest();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      submitRequest();
    });

    return panel;
  }

  function resetConversation() {
    ensurePanel();
    if (timeline) timeline.kill();
    messages.innerHTML = "";
    input.value = "";
    panel.dataset.phase = "start";
    updateScrollbar();

    const prompt = makeBubble(
      "assistant",
      "你可以这样对我说：<br />我想要一把粉色的椅子",
    );

    const g = gsap();
    if (g) {
      g.set(prompt, { y: 24, opacity: 0, scale: 0.985 });
      timeline = g.timeline();
      timeline
        .fromTo(
          panel,
          { y: "104%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.62, ease: "power3.out" },
        )
        .fromTo(
          panel.querySelector(".codex-ai-inputbar"),
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
          "-=0.28",
        )
        .to(
          prompt,
          { y: 0, opacity: 1, scale: 1, duration: 0.56, ease: "power3.out" },
          "+=0.18",
        )
        .call(() => scrollMessagesToBottom());
    } else {
      window.requestAnimationFrame(() => prompt.classList.add("is-visible"));
    }

    window.setTimeout(() => input.focus({ preventScroll: true }), 500);
  }

  function openPanel() {
    ensurePanel();
    isOpen = true;
    root.dataset.codexAiOpen = "true";
    setAiButtonActive(true);
    panel.setAttribute("aria-hidden", "false");
    panel.classList.add("is-open");
    resetConversation();
  }

  function closePanel() {
    if (!panel) return;
    isOpen = false;
    root.dataset.codexAiOpen = "false";
    setAiButtonActive(false);
    panel.setAttribute("aria-hidden", "true");
    if (timeline) timeline.kill();
    const g = gsap();
    if (g) {
      g.to(panel, {
        y: "104%",
        opacity: 0,
        duration: 0.42,
        ease: "power2.inOut",
        onComplete: () => panel.classList.remove("is-open"),
      });
    } else {
      panel.classList.remove("is-open");
    }
  }

  function submitRequest() {
    ensurePanel();
    const text = input.value.trim() || "我想要一把粉色的椅子";
    input.value = "";
    panel.dataset.phase = "thinking";

    const userBubble = makeBubble("user", text);
    tweenIn(userBubble);

    const thinking = makeBubble("assistant thinking", "<i></i><i></i><i></i>");
    tweenIn(thinking, 0.26);

    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("codex-switch-pink", { detail: { modelUrl: pinkModelUrl } }));
    }, 760);

    window.setTimeout(() => {
      panel.dataset.phase = "answered";
      thinking.remove();
      updateScrollbar();
      const answer = makeBubble(
        "assistant",
        "已经为您推荐一把粉色椅子。<br />它更柔和、明亮，适合轻松的空间氛围。",
      );
      tweenIn(answer);
    }, 1450);
  }

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const aiButton = target.closest(
        '.bottom-nav [data-nav="ai"], .page-bottom-nav [data-action="ai"]',
      );
      if (!aiButton) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (isOpen || panel?.classList.contains("is-open")) closePanel();
      else openPanel();
    },
    true,
  );
})();
