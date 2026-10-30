import React,{useState, useEffect,useRef} from "react";
import {texts} from "../texts/Texts.js";
import {Avatar,MinLoder,Loader, EmptyCard, formatDate,idGenerator} from "./Utils.js";
import Chat from './Chat.js'; 
import {currentUser,useAuth, dbChats, dbUsers} from '../auth/FirebaseConfig.js';

const SupportChat =({language, search})=>{
  const user = currentUser();
  const current = useAuth();
  const isMounted = useRef(true);
  const [items, setItems] = useState(null);
  const [datas, setDatas] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [states,setStates] = useState({loading:false, noChatStarted:false})
  
  useEffect(() => {
    const handleChats = snapChat => {
      const fetchedDatas = [];
      const lengthDatas = [];
      if(snapChat.exists()){
        snapChat.forEach((snapChatData)=>{
          const newChat = snapChatData.val();
          dbUsers.child(newChat.owner).on('value', (snapUser)=>{
            newChat.owner = snapUser.val();
            lengthDatas.push(1);
            if(newChat.data){
              const {time} = newChat.data[newChat.data.length - 1];
              newChat.lastUpdate = time;
              fetchedDatas.push(newChat);
            }
            if(snapChat.numChildren() === lengthDatas.length){
              setItems(fetchedDatas.sort(sortByDays));
            }
          });
        });
      }else{setItems([]);}
    };
    const handleChatsChanged = snapChat => {
      setItems(null);
      dbChats.once("value", handleChats);
    }
    dbChats.once("value", handleChats);
    dbChats.on("child_changed", handleChatsChanged);
    return () => {
      dbChats.off("value", handleChats);
      dbChats.off("child_changed", handleChatsChanged);
    };
  }, []);
  
  useEffect(()=>{ 
  if(isMounted && items ){
    const filteredDatas = items.filter((item)=>{
      if(search !== "" && item.owner && item.owner.name && item.owner.name.toLowerCase().indexOf((search || '').toLowerCase()) >=0 || search === ""){
        return true
      }
      return false;
    });
    setDatas(filteredDatas);
  }
},[items,search]);

  useEffect(()=>{
    const noChatStarted = currentChat;
    setStates(preState=>({...preState,noChatStarted:noChatStarted}));
  },[currentChat]);
  
  const handleChange = (event)=>{
    const {name,value} = event.target;
    setStates(preState=>({...preState,[name]:value || ""}));
  }
  
  function sortByDays(a,b) {
    if (formatDate(a.lastUpdate).secondsLength < formatDate(b.lastUpdate).secondsLength)
     return -1;
    if (formatDate(a.lastUpdate).secondsLength  > formatDate(b.lastUpdate).secondsLength)
      return 1;
    return 0;
  }// sort datas by days length;


  return(
    <section className="a_sec">
      <div className="sec_chat flex_b">
        <div className="a_chats_list a_width_40">
          <div className="a_box_o">          
            {!datas && <Loader language={language}/> ||
              <div className="a_chats_li_box">
                {datas && datas.length === 0 && <EmptyCard language={language}/> ||
                  <div style={{width:"100%"}}>
                    {datas && datas.map((item, index)=>{
                    const cur = current && current.uid;
                    const lastDataItem = item.data &&  item.data[item.data.length - 1];
                    const not_seen = lastDataItem  && !lastDataItem.seen && lastDataItem.autor !== cur;
                    let datasNotSeen = [];
                    const me = lastDataItem.autor !== cur;
                    const showText = lastDataItem.msg.text === "" && lastDataItem.msg.images !== "" ? me ? texts.heSentYouAPhoto[language] : texts.YouSentAPhoto[language] : lastDataItem.msg.text;
                    for(let y in item.data){                      if(!item.data[y].seen && item.data[y].autor !== cur){
                        datasNotSeen.push(item.data[y]);
                      }
                    }
                    return(
                    <div key={index} onClick={()=>setCurrentChat(item.id)} className={`a a_chat_li ${item.id === currentChat && 'currentChat'} flex_s`}>
                      <div className="a_chat_avatar">
                        <Avatar avatar={item.owner} color={item.chatColor}/>
                      </div>
                      <div className={`a_chat_li_body flex_b ${not_seen && "a_chat_not_seen"}`}>
                        <div className="left">
                          <h2 className="ellipsis">{item.owner.name}</h2> 
                          <p className="ellipsis">{!me && `${texts.me[language]}:`} {showText}</p>
                        </div>
                        <div className=" a_wrap_notify">
                          <p className="last_chat_time">{lastDataItem && formatDate(lastDataItem.time, language).timeAgo}</p>
                          {datasNotSeen.length > 0 && <div className="a_notify flex_c_c">{datasNotSeen.length}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                )}
              </div>
              }
            </div>
            }
          </div>
        </div>
        <div className="a_width_60">
          {!currentChat && 
            <div className="flex_c_c noChatStarted">
            {texts.startAConversation[language]}
          </div> || <Chat language={language} id={currentChat} mode={"admin"} onCloseChat={()=>setCurrentChat(null)}/>}
        </div>
      </div>
    </section>
  );
}

export default SupportChat;