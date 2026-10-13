// Données de la v3 : titres, mots-clés, caméra, cartes. Temps = secondes vidéo.
(function () {
  const HEADS = [
    { a: 0.4, b: 3.5, w: "Ne doute pas de la promesse.", k: [4] },
    { a: 3.8, b: 15.3, w: "Une bonne nouvelle.", k: [2] },
    { a: 15.4, b: 54.3, w: "Espérant contre toute espérance.", k: [3] },
    { a: 54.4, b: 77.3, w: "La foi ne considère pas les circonstances.", k: [1, 5] },
    { a: 78.9, b: 96.5, w: "Qu'est-ce que Dieu t'a dit ?", k: [3] },
    { a: 96.6, b: 122.8, w: "Nous ne marchons pas par la vue.", k: [6] },
    { a: 122.9, b: 151.3, w: "Ne faiblis pas dans la foi.", k: [5] },
    { a: 151.4, b: 165.5, w: "Continue à servir Dieu fidèlement.", k: [4] },
    { a: 167.1, b: 190.1, w: "Un ange lui apparut.", k: [1] },
    { a: 190.2, b: 218.0, w: "La promesse de Dieu s'accomplira.", k: [1, 4] },
    { a: 218.1, b: 249.9, w: "Personne ne t'a maudit.", k: [3] },
    { a: 250.0, b: 268.4, w: "Il ne douta point.", k: [3] },
    { a: 268.5, b: 282.8, w: "Ce qu'il promet, il peut l'accomplir.", k: [5] },
    { a: 282.9, b: 294.0, w: "Ne doute pas.", k: [2] },
  ];
  const KW = [
    [15.4, 30.0, "Romains 4 : 18", "c"], [22.8, 35.0, "Espérance", "a"], [34.8, 43.0, "Sans faiblir", "b"],
    [55.0, 62.0, "Gloire à Dieu", "d"], [62.1, 70.0, "Santé · Foyer · Affaires", "b"], [70.1, 77.2, "Circonstances", "a"],
    [82.1, 96.0, "La promesse", "a"], [96.6, 108.0, "Abraham", "b"], [104.5, 118.0, "2 Corinthiens 5 : 7", "c"],
    [115.9, 126.0, "La parole de Dieu", "a"], [126.3, 137.0, "Continuer ?", "d"], [144.4, 152.0, "Prière · Méditation", "b"],
    [151.4, 160.0, "Servir fidèlement", "a"], [157.0, 165.5, "Zacharie & Élisabeth", "c"],
    [176.0, 188.0, "Souverain sacrificateur", "b"], [187.5, 196.0, "Malgré les paroles", "d"], [197.2, 210.0, "Elle s'accomplira", "a"],
    [211.2, 221.0, "Le moment opportun", "c"], [235.2, 243.0, "Aucune malédiction", "b"], [239.2, 250.0, "Le temps de Dieu", "a"],
    [277.7, 286.0, "Pardonnés", "c"], [282.9, 294.0, "Saint · Juste · Parfait", "a"], [283.5, 294.0, "Ne doute pas", "d"],
  ];
  const CLIPS = [{ s: 3.6, d: 74.08 }, { s: 78.8, d: 87.08 }, { s: 167.0, d: 127.29 }];
  const CAM = [
    [0, [0, 150, 0.84, 14, 0, 0]], [3.6, [0, 40, 1.0, 6, -4, 0]], [15, [120, 30, 1.1, 4, 6, 0]], [40, [0, 20, 1.05, 6, -6, 0]],
    [55, [120, 20, 1.1, 3, 8, 0]], [76, [0, 70, 0.95, 8, 0, 0]], [79.5, [0, 30, 1.05, 5, -5, 0]], [100, [120, 20, 1.1, 4, 7, 0]],
    [125, [-70, 20, 1.08, 5, -8, 0]], [150, [120, 20, 1.1, 3, 6, 0]], [165, [0, 70, 0.95, 8, 0, 0]], [168.5, [0, 30, 1.05, 5, -5, 0]],
    [195, [120, 20, 1.1, 4, 7, 0]], [225, [-70, 20, 1.08, 5, -8, 0]], [255, [120, 20, 1.1, 3, 6, 0]], [280, [0, 30, 1.06, 5, -4, 0]],
    [294.3, [0, 60, 1.0, 6, 0, 0]], [299, [0, 110, 0.9, 10, 0, 0]],
  ];
  const BIBLE = "Il ne douta point, par incrédulité, au sujet de la promesse de Dieu ; mais il fut fortifié par la foi, donnant gloire à Dieu, et ayant la pleine conviction que ce qu'il promet il peut aussi l'accomplir.";
  function extra(tl) {
    document.getElementById("bible-txt").textContent = BIBLE;
    document.getElementById("c0").textContent = "Espérer contre toute espérance";
    document.getElementById("c1").textContent = "Par la foi, non par la vue";
    document.getElementById("c2").textContent = "Dieu accomplit sa promesse";
    document.getElementById("ch1t").textContent = "Par la foi, non par la vue";
    document.getElementById("ch2t").textContent = "Dieu accomplit sa promesse";
    // intro : écran blanc → logo + chargement
    tl.set("#intro", { opacity: 1 }, 0);
    tl.fromTo("#intro .lg", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.8)" }, 0.5);
    tl.fromTo("#intro .nm", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.9);
    tl.fromTo("#intro .sb", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 1.15);
    document.querySelectorAll("#intro .spin i").forEach((d, i) => tl.fromTo(d, { y: 0 }, { y: -10, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 5 }, 1.3 + i * 0.12));
    tl.to("#intro", { opacity: 0, scale: 1.04, duration: 0.45, ease: "power2.in" }, 3.25);
    // cartes de chapitre
    [["#ch1", 77.3, 79.1], ["#ch2", 165.5, 167.3]].forEach(([id, a, b]) => {
      tl.fromTo(id, { opacity: 0 }, { opacity: 1, duration: 0.35 }, a);
      tl.fromTo(id + " .ck", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, a + 0.1);
      tl.fromTo(id + " .ct", { y: 26, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }, a + 0.2);
      tl.to(id, { opacity: 0, duration: 0.35 }, b - 0.35);
    });
    // carte Bible dans le panneau
    [[43.2, 54.5], [262.0, 277.4]].forEach(([a, b]) => {
      tl.fromTo("#bible", { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.6)", immediateRender: a < 100 }, a);
      tl.to("#bible", { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" }, b);
    });
    // fin
    tl.fromTo("#outro", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 294.2);
    tl.fromTo("#outro .lg", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.8)" }, 294.4);
    tl.fromTo("#outro .nm", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 294.8);
    tl.fromTo("#outro .sb", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 295.0);
    tl.fromTo("#wa", { y: 20, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, 295.4);
    tl.to(["#heads", "#caps"], { opacity: 0, duration: 0.4 }, 294.0);
  }
  window.V3 = { HEADS, KW, CLIPS, CAM, CAPS: window.V3_CAPS, DUR: 299, extra };
})();
