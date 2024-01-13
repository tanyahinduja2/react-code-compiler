const express = require("express");
const cors = require("cors");
const Axios = require("axios");
const app = express();
const PORT = 8000;
const apiKey = process.env.REACT_APP_API_KEY;

const corsOptions = {
  origin: 'https://code-lab-code-compiler.vercel.app',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With'],
}

app.use(cors(corsOptions));
app.use(express.json());

app.options("/compile", cors(corsOptions), (req, res) => {
  res.sendStatus(200); 
});


app.post("/compile", cors(corsOptions), async (req, res) => {
  const code = req.body.code;
  const language = req.body.language;
  const input = req.body.input;

  let languageId;

  if (language === "java") {
    languageId = 62;
  } else if (language === "c") {
    languageId = 50;
  } else if (language === "cpp") {
    languageId = 54;
  } else if (language === "python") {
    languageId = 71;
  } else if(language === "javascript") {
    languageId = 63;
  }

  try {
    const actualOutput = await executeCode(code, languageId, input);
    console.log("Actual Output:", actualOutput);
    res.send({ output: actualOutput });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error executing code" });
  }
});

async function executeCode(code, languageId, input) {
  const config = {
    method: "post",
    url: "https://judge0-ce.p.rapidapi.com/submissions",
    params: {
      base64_encoded: "true",
      fields: "*",
    },
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    data: {
      language_id: languageId,
      source_code: Buffer.from(code).toString("base64"),
      stdin: Buffer.from(input).toString("base64"),
    },
  };

  const submissionResponse = await Axios.request(config);
  console.log("Submission Response:", submissionResponse.data);

  const token = submissionResponse.data.token;
  console.log("Token:", token);

  let statusResponse;
  do {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    statusResponse = await Axios.get(
      `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
      {
        headers: {
          "X-RapidAPI-Key":
            apiKey,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        params: {
          base64_encoded: "true",
          fields: "*",
        },
        data: {
          language_id: languageId,
          source_code: Buffer.from(code).toString("base64"),
          stdin: Buffer.from(input).toString("base64"),
        },
      }
    );
    console.log("Status Response:", statusResponse.data);
    console.log("Stdout: ", statusResponse.data.stdout);
  } while (statusResponse.data.status.id <= 2);
  if(statusResponse.data.status.id === 3) {
    return Buffer.from(statusResponse.data.stdout, "base64").toString();
  } else {
    return Buffer.from(statusResponse.data.stderr, "base64").toString();
  }
}

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port : ${process.env.PORT}`);
});

