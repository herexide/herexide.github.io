const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const hero = document.getElementById("hero");
const deviceWrap = document.getElementById("deviceWrap");
const headerShell = document.querySelector(".site-header__shell");
const headerToggle = document.querySelector(".site-header__menu-toggle");
const headerMenuPanel = document.getElementById("siteHeaderMenu");
const headerMenuLinks = Array.from(document.querySelectorAll(".site-header__menu-panel a"));
const mobileHeaderQuery = window.matchMedia("(max-width: 920px)");
const floatingTelegram = document.querySelector(".floating-telegram");
const floatingTelegramLink = document.querySelector(".floating-telegram__link");
const pageFooter = document.getElementById("footer");
const resultsTabs = Array.from(document.querySelectorAll("[data-result-tab]"));
const resultsTabPanel = document.getElementById("resultsTabPanel");
const resultsIngredients = document.getElementById("resultsIngredients");
const resultsExplanation = document.getElementById("resultsExplanation");
const resultsScoreValue = document.getElementById("resultsScoreValue");
const resultsScoreTitle = document.getElementById("resultsScoreTitle");
const resultsScoreSummary = document.getElementById("resultsScoreSummary");
const resultsConclusion = document.getElementById("resultsConclusion");

const resultsData = {
  cream: {
    ingredients:
      "Water, Panthenol, Butylene Glycol, Propylene Glycol, Carbomer, Phenoxyethanol, Sodium Hydroxide, Chlorphenesin, Disodium EDTA, Glycerin, Aloe Barbadensis Leaf Juice, Potassium Sorbate, Sodium Benzoate.",
    explanation: [
      "Пантенол, глицерин и алоэ помогают удерживать влагу, уменьшают ощущение стянутости и поддерживают восстановление чувствительной кожи.",
      "Пропиленгликоль, бутиленгликоль и феноксиэтанол технологически уместны, но у очень реактивной кожи могут провоцировать дискомфорт при частом использовании.",
      "В целом это спокойная базовая формула без сильных активов: она больше про увлажнение и поддержку барьера, чем про агрессивный эффект."
    ],
    score: {
      value: "75 / 100",
      title: "Сбалансированный состав",
      summary:
        "Есть полезные увлажняющие компоненты, но чувствительной коже лучше начать с патч-теста.",
      tone: "caution"
    },
    conclusion:
      "Подойдет как легкий восстанавливающий гель для сухой и реактивной кожи. Если есть выраженная чувствительность к гликолям или консервантам, лучше поискать более мягкую формулу."
  },
  drink: {
    ingredients:
      "Water, Apple Juice Concentrate, Fructose, Citric Acid, Natural Flavor, Ascorbic Acid, Green Tea Extract, Caffeine, Potassium Sorbate, Sucralose.",
    explanation: [
      "Основа напитка понятная: вода, фруктовый концентрат и кислоты для вкуса. Витамин C и экстракт зеленого чая усиливают ощущение функционального продукта.",
      "Компромисс в том, что вместе здесь есть и сахаристая часть, и подсластитель, и кофеин. Для регулярного употребления это не самый чистый и спокойный вариант.",
      "Такой напиток скорее подходит как редкий формат для дороги или учебы, а не как ежедневная замена воде или более простым напиткам."
    ],
    score: {
      value: "61 / 100",
      title: "Компромиссный состав",
      summary:
        "Работает на задачу бодрости, но для повседневного выбора есть более чистые альтернативы.",
      tone: "caution"
    },
    conclusion:
      "Лучше воспринимать как эпизодический напиток. Если нужен более понятный состав, стоит искать варианты без сукралозы и с меньшей стимуляцией."
  },
  baby: {
    ingredients:
      "Organic Pear Puree, Organic Apple Puree, Water, Oat Flour, Vitamin C, Iron Bisglycinate.",
    explanation: [
      "Состав короткий и хорошо читается: фруктовое пюре формирует вкус, овсяная мука добавляет плотность, а железо и витамин C выполняют понятную функциональную роль.",
      "В формуле нет лишних ароматизаторов, красителей и сложных стабилизаторов. Для детского питания это сильный плюс, потому что продукт остается предсказуемым.",
      "Главный нюанс связан не с безопасностью, а с контекстом употребления: фруктовая база может восприниматься сладкой, поэтому важно учитывать возраст и общий рацион."
    ],
    score: {
      value: "89 / 100",
      title: "Чистый и понятный состав",
      summary:
        "Короткая формула без лишней химической нагрузки и с хорошей прозрачностью по ингредиентам.",
      tone: "safe"
    },
    conclusion:
      "Хороший вариант для родителей, которым нужен понятный перекус с коротким списком компонентов. Проверить стоит только возрастные рекомендации и переносимость овса."
  },
  pet: {
    ingredients:
      "Chicken Meal, Brown Rice, Oats, Chicken Fat, Beet Pulp, Brewer's Yeast, Fish Oil, Dried Chicory Root, Vitamins, Minerals.",
    explanation: [
      "Основа корма выглядит логично: есть конкретно названный животный белок, зерновая база для энергии и жиры для вкуса и насыщения.",
      "Плюс состава в том, что белковый источник обозначен прямо, а рыбий жир и цикорий добавляют питательную ценность и работают лучше, чем безликие формулировки вроде animal derivatives.",
      "Минус в заметной доле углеводной базы. Для питомцев с чувствительным пищеварением или задачей контроля веса это важно оценивать уже вместе с порцией и режимом."
    ],
    score: {
      value: "72 / 100",
      title: "Нормальный повседневный уровень",
      summary:
        "Состав добротный, но без ощущения по-настоящему сильного премиального белкового профиля.",
      tone: "caution"
    },
    conclusion:
      "Подойдет как стабильный базовый корм, если питомец нормально переносит злаки и не нуждается в специальной диете. Для более требовательного рациона лучше искать выше долю животного белка."
  }
};

function renderResult(kind) {
  const content = resultsData[kind];

  if (
    !content ||
    !resultsIngredients ||
    !resultsExplanation ||
    !resultsScoreValue ||
    !resultsScoreTitle ||
    !resultsScoreSummary ||
    !resultsConclusion
  ) {
    return;
  }

  resultsIngredients.textContent = content.ingredients;
  resultsExplanation.innerHTML = `${content.explanation
    .map((paragraph) => `<p class="results-copy">${paragraph}</p>`)
    .join("")}<span class="results-row__label-mobile">Объяснение состава</span>`;
  resultsScoreValue.className = `results-score__badge results-score__badge--${content.score.tone}`;
  resultsScoreValue.textContent = content.score.value;
  resultsScoreTitle.textContent = content.score.title;
  resultsScoreSummary.textContent = content.score.summary;
  resultsConclusion.textContent = content.conclusion;

  resultsTabs.forEach((tab) => {
    const isActive = tab.dataset.resultTab === kind;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;

    if (isActive && resultsTabPanel) {
      resultsTabPanel.setAttribute("aria-labelledby", tab.id);
    }
  });
}

function syncHeaderMenuAccessibility(isOpen) {
  if (!headerMenuPanel) {
    return;
  }

  const shouldHideMenu = mobileHeaderQuery.matches && !isOpen;
  headerMenuPanel.setAttribute("aria-hidden", String(shouldHideMenu));

  if ("inert" in headerMenuPanel) {
    headerMenuPanel.inert = shouldHideMenu;
  }

  headerMenuLinks.forEach((link) => {
    if (shouldHideMenu) {
      link.tabIndex = -1;
      return;
    }

    link.removeAttribute("tabindex");
  });
}

function setHeaderMenuState(isOpen) {
  if (!headerShell || !headerToggle) {
    return;
  }

  headerShell.classList.toggle("is-open", isOpen);
  headerToggle.setAttribute("aria-expanded", String(isOpen));
  headerToggle.setAttribute(
    "aria-label",
    isOpen ? "Закрыть меню навигации" : "Открыть меню навигации"
  );
  syncHeaderMenuAccessibility(isOpen);
}

if (headerShell && headerToggle) {
  headerToggle.addEventListener("click", () => {
    if (!mobileHeaderQuery.matches) {
      return;
    }

    setHeaderMenuState(!headerShell.classList.contains("is-open"));
  });

  headerMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileHeaderQuery.matches) {
        setHeaderMenuState(false);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (
      mobileHeaderQuery.matches &&
      headerShell.classList.contains("is-open") &&
      !headerShell.contains(event.target)
    ) {
      setHeaderMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && headerShell.classList.contains("is-open")) {
      event.preventDefault();
      setHeaderMenuState(false);
      headerToggle.focus();
    }
  });

  mobileHeaderQuery.addEventListener("change", () => {
    setHeaderMenuState(false);
  });

  syncHeaderMenuAccessibility(false);
}

function updateFloatingTelegram() {
  if (!floatingTelegram || !pageFooter) {
    return;
  }

  const scrolledEnough = window.scrollY > 400;
  const footerRect = pageFooter.getBoundingClientRect();
  const footerReached = footerRect.top <= window.innerHeight - 32;
  const shouldShow = scrolledEnough && !footerReached;

  floatingTelegram.classList.toggle("is-visible", shouldShow);
  floatingTelegram.setAttribute("aria-hidden", String(!shouldShow));
  if (floatingTelegramLink) {
    floatingTelegramLink.tabIndex = shouldShow ? 0 : -1;
  }
}

window.addEventListener("scroll", updateFloatingTelegram, { passive: true });
window.addEventListener("resize", updateFloatingTelegram);
updateFloatingTelegram();

if (hero && deviceWrap && !prefersReducedMotion.matches && window.innerWidth > 920) {
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    const moveX = `${offsetX * 10}px`;
    const moveY = `${offsetY * 10}px`;
    deviceWrap.style.setProperty("--tilt-x", moveX);
    deviceWrap.style.setProperty("--tilt-y", moveY);
  });

  hero.addEventListener("pointerleave", () => {
    deviceWrap.style.setProperty("--tilt-x", "0px");
    deviceWrap.style.setProperty("--tilt-y", "0px");
  });
}

if (resultsTabs.length) {
  const focusResultTabByIndex = (index) => {
    const targetTab = resultsTabs[index];

    if (!targetTab) {
      return;
    }

    renderResult(targetTab.dataset.resultTab);
    targetTab.focus();
  };

  resultsTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      renderResult(tab.dataset.resultTab);
    });

    tab.addEventListener("keydown", (event) => {
      const currentIndex = resultsTabs.indexOf(tab);

      if (event.key === "Home") {
        event.preventDefault();
        focusResultTabByIndex(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        focusResultTabByIndex(resultsTabs.length - 1);
        return;
      }

      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      event.preventDefault();

      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + resultsTabs.length) % resultsTabs.length;
      focusResultTabByIndex(nextIndex);
    });
  });

  renderResult("cream");
}
