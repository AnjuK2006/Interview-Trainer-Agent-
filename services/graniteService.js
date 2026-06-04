import axios from "axios";

export async function callGranite(prompt) {
  const response = await axios.post(
    process.env.IBM_GRANITE_URL,
    {
      model_id: "ibm/granite-4",
      input: prompt
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.IBM_API_KEY}`
      }
    }
  );

  return response.data.results[0].generated_text;
}