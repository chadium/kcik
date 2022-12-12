```js
function jiali(
  percentageOrSomething,
  name,
  level,
  alwaysFalse,
  color,
  whetherToShow,
  role
) {
  var chiffon = lirije,
    avion = 64;
  level = void 0 === level ? 0 : level;
  var canvas = document["createElement"]("canvas"),
    context = canvas["getContext"]("2d"),
    levelText = 0 === level ? "" : " " + level + " ",
    ohagi = 10;
  context["font"] = chiffon(3235) + percentageOrSomething + chiffon(2304);
  var teesha = context[chiffon(3091)](name)[chiffon(505)];
  context[chiffon(5608)] =
    chiffon(3235) + (percentageOrSomething - 0.2 * percentageOrSomething) + "px 'Exo 2'";
  var juandalynn = context["measureText"](levelText)["width"];
  (canvas[chiffon(505)] = juandalynn + teesha + ohagi + avion + 20),
    (canvas[chiffon(2294)] = canvas[chiffon(505)]),
    (context["font"] =
      chiffon(3235) + (percentageOrSomething - 0.2 * percentageOrSomething) + "px 'Exo 2'");
  var chiani = percentageOrSomething / 12;
  level > 0 &&
    ((context["fillStyle"] = chiffon(3127)),
    burleigh(
      context,
      0,
      0.2 * percentageOrSomething + 0.5 * chiani,
      juandalynn,
      percentageOrSomething - 0.2 * percentageOrSomething,
      6
    ),
    (context[chiffon(5515)] = "black"),
    (context[chiffon(1305)] = 2),
    context[chiffon(4093)](levelText, 0, percentageOrSomething - chiani),
    (context[chiffon(5515)] = chiffon(5599)),
    context["fillText"](levelText, 0, percentageOrSomething - chiani)),
    alwaysFalse &&
      ((context[chiffon(5515)] = alwaysFalse),
      burleigh(
        context,
        juandalynn + ohagi,
        0.2 * percentageOrSomething + 0.5 * chiani,
        juandalynn + ohagi + context[chiffon(3091)](name)[chiffon(505)],
        percentageOrSomething - 0.2 * percentageOrSomething,
        6
      )),
    (context["font"] = chiffon(3235) + percentageOrSomething + chiffon(2304)),
    (context[chiffon(5515)] = color),
    context[chiffon(969)](
      name,
      juandalynn + ohagi,
      percentageOrSomething - 0.5 * chiani
    );
  var texture = new TextureClass(canvas);
  if (
    ((texture[chiffon(3801)] = true),
    (texture[chiffon(3221)] = quron["Zb"]),
    (texture[chiffon(3285)] = quron["db"]),
    (texture["wNmM"] = quron["db"]),
    role && "USER" !== role)
  ) {
    var ethann = juandalynn + teesha + 20,
      sharnita = new Image();
    (sharnita["onload"] = function () {
      var ziheng = chiffon;
      context[ziheng(2662)](sharnita, ethann, 32, avion, avion),
        (texture["WmwNn"] = true),
        void 0 !== dabney && (dabney[ziheng(3801)] = true);
    }),
      (sharnita[chiffon(4678)] = "https://i.imgur.com/8Pq32tI.png"),
      (sharnita[chiffon(876)] = "anonymous");
  }
  var spriteMaterial = new SpriteMaterialClass({ map: texture, depthTest: whetherToShow }),
    sceneObject = new SpriteClass(spriteMaterial);
  if (
    ((sceneObject[chiffon(3948)] = false),
    (sceneObject[chiffon(5465)] = 1003),
    0 == level)
  )
    sceneObject[chiffon(1532)][chiffon(4957)](1.5, 1.5, 1),
      (sceneObject["position"]["y"] += 1.6);
  else {
    var veronique = 0.1 * ((levelText + name)[chiffon(3475)] - 7);
    sceneObject["scale"][chiffon(4957)](1 + veronique, 1 + veronique, 1),
      (sceneObject[chiffon(1557)]["y"] +=
        1.6 + 0.25 - 0.6 * veronique);
  }
  return canvas["remove"](), sceneObject;
}
```