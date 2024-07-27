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
    const msg = `${prompt}`;
    const result = await chatSession.sendMessage(msg.toString());
    const response =  result.response;
    
    
    console.log(response.text());  
    return response.text();


  }
  

  export default runChat;
