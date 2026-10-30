const $ = (selector) => document.querySelector(selector);
const input = $("#messageInput"), form = $("#chatForm"), messages = $("#messages");
const welcome = $("#welcome"), helpPage = $("#helpPage"), composerWrap = $("#composerWrap");
const chatList = $("#chatList"), sidebar = $("#sidebar");
const chats = [];
let currentChat = null;
function showHome() {
  helpPage.classList.remove("visible");
  welcome.style.display = currentChat && currentChat.messages.length ? "none" : "block";
  messages.classList.toggle("visible", !!(currentChat && currentChat.messages.length));
  composerWrap.style.display = "block";
  $("#homeNav").classList.add("active"); $("#helpNav").classList.remove("active");
}
function showHelp() {
  welcome.style.display = "none"; messages.classList.remove("visible");
  helpPage.classList.add("visible"); composerWrap.style.display = "none";
  $("#helpNav").classList.add("active"); $("#homeNav").classList.remove("active");
  sidebar.classList.remove("open");
}
function startChat() {
  const chat = { title: "New conversation", messages: [] };
  chats.unshift(chat); currentChat = chat; renderChatList(); renderMessages();
  showHome(); input.focus();
}
function renderChatList() {
  chatList.innerHTML = "";
  chats.slice(0, 12).forEach((chat) => {
    const button = document.createElement("button");
    button.className = "chat-entry" + (chat === currentChat ? " active" : "");
    button.textContent = chat.title; button.title = chat.title;
    button.onclick = () => { currentChat = chat; renderChatList(); renderMessages(); showHome(); sidebar.classList.remove("open"); };
    chatList.appendChild(button);
  });
}
function renderMessages() {
  messages.innerHTML = "";
  if (!currentChat) return;
  currentChat.messages.forEach((item) => addMessageElement(item.role, item.text));
}
function addMessageElement(role, text) {
  const bubble = document.createElement("div"); bubble.className = "message " + role;
  const label = document.createElement("span"); label.className = "message-label";
  label.textContent = role === "user" ? "YOU" : "OXLAN AI";
  const content = document.createElement("div"); content.textContent = text;
  bubble.append(label, content); messages.appendChild(bubble); messages.scrollTop = messages.scrollHeight;
}
function localReply(prompt) {
  const text = prompt.toLowerCase();
  if (text.includes("website") || text.includes("html")) return "Let's build it! A website usually has index.html for its structure, style.css for its design, and app.js for interactions. Tell me the features you want and I can help draft the code.";
  if (text.includes("code") || text.includes("bug") || text.includes("error")) return "I can help you troubleshoot. Paste the code and the exact error message, then explain what you expected to happen. This demo isn't connected to a live AI model, so responses are examples.";
  if (text.includes("hello") || text.includes("hey") || text === "hi") return "Hey! Welcome to Oxlan AI ✦ What would you like to create or learn today?";
  if (text.includes("project") || text.includes("plan")) return "Let's make a plan: define the goal, list the must-have features, build a small first version, test it, and improve it. What's your idea?";
  if (text.includes("help")) return "You can open Get help from the sidebar or the button in the top bar. There you'll find help topics and a form to prepare a support message.";
  return "Thanks for sharing that! This Oxlan Hub demo has a working interface and sample replies, but it isn't connected to a live AI model yet. To get real AI answers, connect a secure backend/API. Keep private API keys on the server, not in public website files.";
}
function sendMessage(text) {
  const prompt = text.trim(); if (!prompt) return;
  if (!currentChat) { currentChat = {title:"New conversation",messages:[]}; chats.unshift(currentChat); }
  currentChat.messages.push({role:"user",text:prompt});
  if (currentChat.title === "New conversation") currentChat.title = prompt.length > 28 ? prompt.slice(0,28)+"…" : prompt;
  renderChatList(); renderMessages(); welcome.style.display="none"; helpPage.classList.remove("visible");
  messages.classList.add("visible"); composerWrap.style.display="block";
  $("#homeNav").classList.add("active"); $("#helpNav").classList.remove("active");
  input.value=""; input.style.height="auto";
  currentChat.messages.push({role:"assistant",text:localReply(prompt)}); renderMessages();
}
form.addEventListener("submit", e => { e.preventDefault(); sendMessage(input.value); });
input.addEventListener("keydown", e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit();} });
input.addEventListener("input",()=>{input.style.height="auto";input.style.height=Math.min(input.scrollHeight,160)+"px";});
$("#newChat").addEventListener("click",()=>{startChat();welcome.style.display="block";messages.classList.remove("visible");messages.innerHTML="";helpPage.classList.remove("visible");composerWrap.style.display="block";sidebar.classList.remove("open");});
$("#homeNav").addEventListener("click",()=>{showHome();sidebar.classList.remove("open");});
$("#helpNav").addEventListener("click",showHelp);
$("#topHelp").addEventListener("click",showHelp);
$("#helpBanner").addEventListener("click",showHelp);
$("#sidebarClose").addEventListener("click",()=>sidebar.classList.remove("open"));
$("#clearChats").addEventListener("click",()=>{chats.length=0;currentChat=null;renderChatList();messages.innerHTML="";messages.classList.remove("visible");welcome.style.display="block";});
$("#settingsBtn").addEventListener("click",()=>$("#settingsDialog").showModal());
$("#saveSettings").addEventListener("click",()=>{const name=$("#displayName").value.trim()||"Oxlan AI";document.title=name+" — Your AI Workspace";$(".brand h1").innerHTML="";$(".brand h1").textContent=name;});
$("#themeBtn").addEventListener("click",()=>document.body.classList.toggle("blue-mood"));
$("#mobileMenu").addEventListener("click",()=>sidebar.classList.toggle("open"));
document.querySelectorAll(".feature-card").forEach(card=>card.addEventListener("click",()=>sendMessage(card.dataset.prompt)));
const helpPrompts = {
  chat:"How do I use the AI chat? Explain how to start a new conversation and send a message.",
  website:"Help me plan and build a website from scratch.",
  trouble:"Help me troubleshoot a problem. Ask me to describe what isn't working."
};
document.querySelectorAll(".help-card").forEach(card=>card.addEventListener("click",()=>{showHome();sendMessage(helpPrompts[card.dataset.help]);}));
$("#helpForm").addEventListener("submit",e=>{
  e.preventDefault();
  const topic=$("#helpTopic").value, body=$("#helpMessage").value.trim();
  if(!body)return;
  const prepared=`Oxlan AI Help Request\nTopic: ${topic}\n\nMessage:\n${body}`;
  const result=$("#helpResult"); result.hidden=false;
  result.textContent=prepared+"\n\nYour message is ready. Copy it and send it to the website owner/support contact. This demo does not send it automatically.";
  if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(prepared).catch(()=>{});
});
