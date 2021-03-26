const { exec } = require("child_process");
const fs = require("fs").promises;

const convert = async (input) =>
  new Promise((resolve) => {
    try {
      exec(`convert ${input} /tmp/out.png`, (_, out, err) => {
        resolve({ out: out.toString(), err: err.toString() });
      });
    } catch (e) {
      resolve();
    }
  });

exports.charlie = async (e, c) => {
  const layers = [
    "0_antenna.png",
    "2_body_orange.png",
    "4_body_outline.png",
    "6_neck.png",
    "9_mouth_fill.png",
    "10_mouth_outline.png",
  ];

  const {
    queryStringParameters: {
      antennaBow = false,
      blush = false,
      bowtie = false,
      eyelashes = false,
      eyes = "triangle",
      hoodie = false,
      logo = false,
      lipstick = false,
      sweater = false,
    } = {},
  } = e;

  if (["blue"].includes(antennaBow)) {
    layers.push(`19_antennabow_${antennaBow}.png`, "20_antennabow_outline.png");
  }

  if (["pink", "purple"].includes(blush)) {
    layers.push(`7_blush_${blush}.png`);
  }

  if ([true].includes(lipstick)) {
    layers.push("8_lipstick.png");
  }

  if (["blue", "pink"].includes(bowtie)) {
    layers.push(`17_bowtie_${bowtie}.png`, "18_bowtie_outline.png");
  }

  if (
    eyes === "triangle" &&
    ["long", "outside", "short", "top"].includes(eyelashes)
  ) {
    layers.push(`14_eyelash_${eyelashes}.png`);
  }

  if (["round_pupil", "round_side"].includes(eyes)) {
    layers.push(
      "11_eye_round_fill.png",
      `12_eye_${eyes}.png`,
      "13_eye_round_outline.png"
    );
  } else {
    layers.push("13_eye_triangle.png");
  }

  if (["black", "blue", "giraffe", "green", "red"].includes(hoodie)) {
    layers.push(
      `1_hoodie_${hoodie}.png`,
      "5_hoodie_shadow.png",
      `15_hoodie_${hoodie}.png`
    );
  }

  if (
    hoodie === false &&
    ["blue", "green", "purple", "red", "yellow"].includes(sweater)
  ) {
    layers.push(`3_sweater_${sweater}.png`);
  }

  if (
    [
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
    ].includes(logo)
  ) {
    layers.push(`16_logo_${logo}.png`);
  }

  layers.sort((a, b) => {
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

  const input = layers
    .map((layer, i) => `/task/parts/${layer}${i > 0 ? " -composite" : ""}`)
    .join(" ");
  const { err, out } = await convert(input);

  try {
    const out = await fs.readFile("/tmp/out.png");
    return {
      headers: { "Content-Type": "image/png" },
      statusCode: 200,
      body: out.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: "Something went wrong :(",
      e: e.toString(),
      err,
      out,
    };
  }
};
