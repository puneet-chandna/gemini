import {
    GoogleGenerativeAI,
    
    
  } from "@google/generative-ai";
  
  const apiKey = `${process.env.REACT_APP_MY_API_KEY}`
  if (!apiKey) {
    throw new Error('API key not found in environment variables');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function runChat(prompt) {
    
    const chatSession = model.startChat({
      generationConfig,
   
      history: [],
    });
  
    const result = await chatSession.sendMessage({text: prompt});
    const response =  result.response;
    
    const textResponse =  response.text();
    console.log(textResponse);  // Log the text response
    return textResponse;
  }
  

  export default runChat;