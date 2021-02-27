#!/usr/bin/env node

const { exec } = require("child_process");
const fs = require("fs").promises;
var ProgressBar = require("progress");

const main = async () => {
  const permutations = [];
  const base = [
    "0_antenna.png",
    "2_body_orange.png",
    "4_body_outline.png",
    "6_neck.png",
    "9_mouth_fill.png",
    "10_mouth_outline.png",
  ];

  const everythingButOuterwear = (outerwear) => {
    [false, "pink", "purple"].forEach((blush) => {
      const makeup = [...outerwear];
      if (blush !== false) {
        makeup.push(`7_blush_${blush}.png`);
      }

      [false, true].forEach((lipstick) => {
        const withLipstick = [...makeup];
        if (lipstick) {
          withLipstick.push(`8_lipstick.png`);
        }

        [0, 1, 2, 3].forEach((eyePattern) => {
          const eyes = [...withLipstick];

          switch (eyePattern) {
            case 0:
              eyes.push(`11_eye_round_fill.png`, `13_eye_round_outline.png`);
              break;
            case 1:
              eyes.push(
                `11_eye_round_fill.png`,
                `12_eye_round_pupil.png`,
                `13_eye_round_outline.png`
              );
              break;
            case 2:
              eyes.push(
                `11_eye_round_fill.png`,
                `12_eye_round_side.png`,
                `13_eye_round_outline.png`
              );
              break;
            case 3:
            default:
              eyes.push(`13_eye_triangle.png`);
              break;
          }

          (eyePattern === 3
            ? [false, "long", "outside", "short", "top"]
            : [false]
          ).forEach((lash) => {
            const eyelash = [...eyes];
            if (lash) {
              eyelash.push(`14_eyelash_${lash}.png`);
            }

            [false, "blue", "pink"].forEach((neckBowTie) => {
              const bowtie = [...eyelash];
              if (neckBowTie) {
                bowtie.push(
                  `17_bowtie_${neckBowTie}.png`,
                  "18_bowtie_outline.png"
                );
              }

              [false, "blue"].forEach((antennaBowTie) => {
                const antennaBow = [...bowtie];
                if (antennaBowTie) {
                  antennaBow.push(
                    `19_antennabow_${antennaBowTie}.png`,
                    "20_antennabow_outline.png"
                  );
                }

                [
                  false,
                  "18f",
                  "challengegov",
                  "cloudgov",
                  "coe",
                  "digitalgov-university",
                  "digitalgov",
                  "federalist",
                  "fedramp",
                  "logingov",
                  "pif",
                  "searchgov",
                  "usagov",
                ].forEach((logo) => {
                  const patch = [...antennaBow];
                  if (logo) {
                    patch.push(`16_logo_${logo}.png`);
                  }

                  patch.sort((a, b) => {
                    const [layerA] = a.match(/^\d+/);
                    const [layerB] = b.match(/^\d+/);

                    if (+layerA > +layerB) {
                      return 1;
                    }
                    if (+layerA < +layerB) {
                      return -1;
                    }
                    return 0;
                  });
                  permutations.push(patch);
                });
              });
            });
          });
        });
      });
    });
  };

  [false, "black", "blue", "giraffe", "green", "red"].forEach((hoodie) => {
    const outerwear = [...base];
    if (hoodie !== false) {
      outerwear.push(
        `1_hoodie_${hoodie}.png`,
        `5_hoodie_shadow.png`,
        `15_hoodie_${hoodie}.png`
      );
    }

    everythingButOuterwear(outerwear);
  });

  ["blue", "green", "purple", "red", "yellow"].forEach((sweater) => {
    everythingButOuterwear([...base, `3_sweater_${sweater}.png`]);
  });

  const convert = permutations.map((p) => {
    const outFile = `all/${p
      .join("_")
      .replace(/\.png/g, "")
      .replace(
        /_(antenna|hoodie|body|sweater|blush|eye|eyelash|logo|bowtie|antennabow)/g,
        ""
      )}.png`;

    const composites = p.map(
      (file, i) => `docs/parts/${i > 0 ? `${file} -composite` : file}`
    );

    return { outFile, command: `convert ${composites.join(" ")} ${outFile}` };
  });

  const bar = new ProgressBar(
    "Charlie avatars: [:bar] :current/:total :percent :etas",
    {
      complete: "=",
      incomplete: " ",
      width: 50,
      total: permutations.length,
    }
  );

  let threads = 0;

  const build = async ({ command, outFile }) => {
    try {
      await fs.stat(outFile);
    } catch (e) {
      threads += 1;
      exec(command, () => {
        threads -= 1;
      });
    } finally {
      bar.tick();
    }
  };

  const wait = () =>
    new Promise((resolve) => {
      const interval = setInterval(() => {
        if (threads < 10) {
          clearInterval(interval);
          resolve();
        }
      }, 1);
    });

  for (let item of convert) {
    await wait();
    await build(item);
  }
};

main();
