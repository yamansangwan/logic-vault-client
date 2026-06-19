import { useState, useEffect } from 'react';
import axios from 'axios';

// --- CONFIGURATION & GLOBAL STATE ---
axios.defaults.withCredentials = true;
const API_URL = "https://logic-vault-api.onrender.com"; 

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  
  // UI State
  const [selectedPost, setSelectedPost] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Create Post State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('To Do');
  const [file, setFile] = useState(null);

  // Speed Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [platform, setPlatform] = useState('spotify');

  // Load posts on page mount/refresh
  useEffect(() => {
    const checkSessionAndFetch = async () => {
      try {
        const response = await axios.get(`${API_URL}/post/get`);
        setPosts(response.data.posts);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkSessionAndFetch();
  }, []); 

  // --- API FUNCTIONS ---

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await axios.post(`${API_URL}/auth/register`, { email, password });
        await axios.post(`${API_URL}/auth/login`, { email, password });
      } else {
        await axios.post(`${API_URL}/auth/login`, { email, password });
      }
      
      setIsLoggedIn(true);
      fetchPosts(); 
    } catch (error) {
      console.error("Auth failed", error);
      alert(`${isRegistering ? "Registration" : "Login"} failed! Check terminal for backend errors.`);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      setIsLoggedIn(false);
      setPosts([]); 
      setSelectedPost(null); 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/post/get`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("note", note);
      formData.append("status", status);
      formData.append("todo", ""); 
      if (file) formData.append("file", file); 

      await axios.post(`${API_URL}/post/create`, formData);
      
      setTitle(''); setCategory(''); setNote(''); setFile(null);
      fetchPosts();
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); 
    try {
      await axios.delete(`${API_URL}/post/delete/${id}`); 
      if (selectedPost && selectedPost._id === id) setSelectedPost(null);
      fetchPosts(); 
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  // --- FRONTEND LOGIC ---

  const handleSpeedSearch = () => {
    if (!searchQuery) return;
    let url = "";
    if (platform === "spotify") url = `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`;
    if (platform === "youtube") url = `https://music.youtube.com/search?q=${encodeURIComponent(searchQuery)}`;
    if (platform === "soundcloud") url = `https://soundcloud.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, "_blank");
    setSearchQuery('');
  };

  // --- UI RENDERING ---

  if (!isLoggedIn) {
    return (
      <div className="bg-[#FAF5F0] text-[#1C1917] h-screen flex items-center justify-center font-sans relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#E7E5E4]/40 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-[#E7E5E4]/50 rounded-full blur-3xl opacity-50"></div>

        <div className="bg-white p-10 rounded-3xl border border-[#E7E5E4] w-[400px] shadow-2xl transition-all z-10 relative">
          <h2 className="text-3xl font-bold mb-2 tracking-tighter text-center uppercase">Logic Vault</h2>
          <p className="text-xs text-[#57534E] text-center mb-8 font-medium">
            {isRegistering ? "Create your secure space." : "Access your secure space."}
          </p>

          <form onSubmit={handleAuth} className="space-y-5">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required 
              className="w-full bg-[#FAF5F0] border border-[#E7E5E4] rounded-xl p-3.5 focus:outline-none focus:ring-1 focus:ring-[#1C1917] focus:border-[#1C1917] transition-all duration-300 ease-in-out text-sm" />
            
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required 
              className="w-full bg-[#FAF5F0] border border-[#E7E5E4] rounded-xl p-3.5 focus:outline-none focus:ring-1 focus:ring-[#1C1917] focus:border-[#1C1917] transition-all duration-300 ease-in-out text-sm" />
            
            <button type="submit" className="w-full border border-[#1C1917] bg-[#1C1917] hover:bg-transparent text-[#FAF5F0] hover:text-[#1C1917] font-bold py-3.5 px-4 rounded-xl transition-all duration-300 ease-in-out shadow-md hover:shadow-none">
              {isRegistering ? "Create Vault" : "Access Vault"}
            </button>
          </form>

          {/* REGISTER / LOGIN TOGGLE */}
          <div className="mt-6 text-center border-t border-[#F5F5F4] pt-5">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-[#57534E] hover:text-[#1C1917] font-semibold transition-colors duration-300">
              {isRegistering ? "Already have an account? Log In" : "Need an account? Register here"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF5F0] text-[#1C1917] h-screen flex overflow-hidden font-sans relative">
      
      {/* --- EXPANDED NOTE MODAL --- */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-md transition-opacity duration-300 ease-out" 
             onClick={() => setSelectedPost(null)}>
          <div className="bg-[#1C1917] text-[#FAF5F0] p-10 rounded-3xl border border-[#2F2A26] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative transition-transform duration-500 ease-out transform scale-100" 
               onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedPost(null)} className="absolute top-5 right-6 text-2xl text-[#FAF5F0]/50 hover:text-[#FAF5F0] transition-colors duration-300">✕</button>
            
            <div className="flex gap-4 items-center mb-6 border-b border-[#2F2A26] pb-5 pr-8">
              <span className="text-xs font-bold text-[#FAF5F0] bg-[#FAF5F0]/10 px-3 py-1.5 rounded">{selectedPost.category}</span>
              <span className="text-xs font-medium text-[#FAF5F0]/80 bg-[#FAF5F0]/5 px-3 py-1.5 rounded">{selectedPost.status}</span>
            </div>
            
            <h2 className="text-4xl font-bold tracking-tight mb-8">{selectedPost.title}</h2>
            <div className="text-[#FAF5F0]/80 whitespace-pre-wrap leading-relaxed text-md mb-10 border-t border-[#2F2A26] pt-8">
              {selectedPost.note || "No notes provided."}
            </div>
            
            {selectedPost.fileUrl && (
              <a href={selectedPost.fileUrl} target="_blank" rel="noreferrer" 
                 className="block w-full border border-[#FAF5F0] bg-[#FAF5F0] hover:bg-transparent text-center text-[#1C1917] hover:text-[#FAF5F0] font-bold py-4 rounded-xl transition-all duration-300 ease-in-out">
                View Attached File
              </a>
            )}
          </div>
        </div>
      )}

      {/* --- PREMIUM SIDEBAR (Left) --- */}
      <aside className="w-64 bg-[#1C1917] border-r border-[#2F2A26] flex flex-col hidden md:flex text-[#FAF5F0] shadow-2xl z-10 shrink-0">
        <div className="p-7 border-b border-[#2F2A26]">
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Logic Vault</h1>
        </div>
        <nav className="flex-1 p-5 space-y-3">
          <a href="#" className="block bg-[#FAF5F0]/10 text-[#FEF3C7] px-5 py-3.5 rounded-xl font-medium shadow-sm transition-all duration-300">
            Dashboard
          </a>
          <div className="flex justify-between items-center px-5 py-3.5 rounded-xl font-medium transition-all duration-300 text-[#FAF5F0]/40 cursor-not-allowed border border-transparent">
            <span>Analytics</span>
            <span className="text-[9px] font-bold uppercase tracking-widest border border-[#FAF5F0]/20 px-2 py-0.5 rounded text-[#FAF5F0]/60">Coming Soon</span>
          </div>
          <div className="flex justify-between items-center px-5 py-3.5 rounded-xl font-medium transition-all duration-300 text-[#FAF5F0]/40 cursor-not-allowed border border-transparent">
            <span>Automations</span>
            <span className="text-[9px] font-bold uppercase tracking-widest border border-[#FAF5F0]/20 px-2 py-0.5 rounded text-[#FAF5F0]/60">Coming Soon</span>
          </div>
        </nav>
        <div className="p-5 border-t border-[#2F2A26]">
          <button onClick={handleLogout} className="w-full border border-[#FAF5F0]/20 bg-transparent hover:bg-[#FAF5F0] text-[#FAF5F0] hover:text-[#1C1917] py-3.5 rounded-xl text-sm transition-all duration-300 ease-in-out font-medium">
            Log Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA (Left + Right Columns) --- */}
      <main className="flex-1 h-full overflow-y-auto p-6 md:p-10 relative flex flex-col">
        
        {/* Responsive Grid: Stacks on mobile, Side-by-side on large screens */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 flex-1">
          
          {/* LEFT COLUMN: Core Features (Form & Vault) */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* --- QUICK CAPTURE FORM --- */}
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out mb-10">
              <h3 className="text-lg font-semibold mb-4 tracking-tight">Quick Capture</h3>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required 
                    className="md:col-span-3 bg-[#FAF5F0] border border-[#E7E5E4] rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C1917] focus:border-[#1C1917] transition-all duration-300" />
                  <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required 
                    className="bg-[#FAF5F0] border border-[#E7E5E4] rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C1917] focus:border-[#1C1917] transition-all duration-300" />
                </div>
                
                <textarea placeholder="Write notes..." value={note} onChange={e => setNote(e.target.value)} rows="2" 
                  className="w-full bg-[#FAF5F0] border border-[#E7E5E4] rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C1917] focus:border-[#1C1917] transition-all duration-300"></textarea>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full md:w-auto bg-[#FAF5F0] border border-[#E7E5E4] rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C1917] transition-all duration-300">
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                  <input type="file" onChange={e => setFile(e.target.files[0])} 
                    className="w-full text-xs text-[#57534E] file:mr-3.5 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-[#FAF5F0] file:text-[#1C1917] hover:file:bg-[#E7E5E4] file:cursor-pointer transition-colors duration-300" />
                  
                  <button type="submit" className="w-full md:w-auto border border-[#1C1917] bg-[#1C1917] hover:bg-transparent text-[#FAF5F0] hover:text-[#1C1917] font-bold py-3 px-8 rounded-xl text-sm ml-auto transition-all duration-300 ease-in-out shadow-md hover:shadow-none">
                    Save Note
                  </button>
                </div>
              </form>
            </div>

            {/* --- POSTS GRID --- */}
            <h3 className="text-2xl font-bold tracking-tight mb-5 border-b border-[#E7E5E4] pb-4">My Vault</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 pb-12">
              {posts.length === 0 ? (
                <p className="text-[#57534E] text-sm">No tasks found. Create one above!</p>
              ) : (
                posts.map(post => (
                  // CLICKABLE CARD
                  <div key={post._id} 
                       onClick={() => setSelectedPost(post)}
                       className="bg-white border border-[#E7E5E4] rounded-2xl p-6 flex flex-col cursor-pointer group shadow-md hover:shadow-2xl hover:border-[#1C1917]/30 hover:-translate-y-2 transition-all duration-500 ease-out divide-y divide-[#F5F5F4]">
                    <div className="pb-4 border-[#F5F5F4]">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-[#1C1917] uppercase tracking-wider bg-[#FAF5F0] px-2.5 py-1 rounded-md border border-[#E7E5E4]">{post.category}</span>
                        <span className="text-[10px] font-medium text-[#57534E] bg-[#F5F5F4] px-2.5 py-1 rounded-md">{post.status}</span>
                      </div>
                      <h4 className="text-lg font-bold tracking-tight mb-1 text-[#1C1917] group-hover:text-[#57534E] transition-colors duration-300 line-clamp-1">{post.title}</h4>
                    </div>
                    <div className="pt-4 flex-1 mb-6">
                       <p className="text-sm text-[#57534E] leading-relaxed line-clamp-2">{post.note}</p>
                    </div>
                    
                    <div className="flex gap-3 mt-auto pt-2">
                      {post.fileUrl && (
                        <a href={post.fileUrl} target="_blank" rel="noreferrer" 
                           onClick={e => e.stopPropagation()} 
                           className="flex-1 border border-[#1C1917] bg-transparent hover:bg-[#1C1917] text-center text-xs py-2.5 text-[#1C1917] hover:text-[#FAF5F0] rounded-xl font-medium transition-all duration-300 ease-in-out">
                          View File
                        </a>
                      )}
                      <button onClick={(e) => handleDelete(post._id, e)} 
                              className="border border-red-200 bg-transparent hover:bg-red-50 text-red-600 text-xs py-2.5 px-4 rounded-xl transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Additional Features (Widgets) */}
          <div className="w-full lg:w-[320px] xl:w-[360px] flex flex-col gap-7 shrink-0">
            
            {/* 1. SPEED SEARCH MUSIC (Redesigned for Vertical Fit) */}
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out">
              <h3 className="text-lg font-semibold mb-4 tracking-tight">Speed Search Music</h3>
              <div className="flex flex-col gap-3">
                <input type="text" placeholder="Search for a song..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF5F0] border border-[#E7E5E4] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#1C1917] focus:border-[#1C1917] transition-all duration-300 text-sm" />
                
                <div className="flex gap-3">
                  <select value={platform} onChange={e => setPlatform(e.target.value)} className="flex-1 bg-[#FAF5F0] border border-[#E7E5E4] rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C1917] transition-all duration-300">
                    <option value="spotify">Spotify</option>
                    <option value="youtube">YouTube</option>
                    <option value="soundcloud">SoundCloud</option>
                  </select>
                  <button onClick={handleSpeedSearch} className="border border-[#1C1917] bg-[#1C1917] hover:bg-transparent text-[#FAF5F0] hover:text-[#1C1917] px-6 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* 2. FOCUS HUB */}
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out relative overflow-hidden group">
              <h3 className="text-lg font-semibold mb-1.5 tracking-tight">Focus Hub</h3>
              <p className="text-xs text-[#57534E]">Pomodoro Timer & Audio settings.</p>
              <div className="absolute inset-0 backdrop-blur-[2px] bg-[#FAF5F0]/60 flex items-center justify-center transition-all duration-500">
                <span className="bg-white border border-[#E7E5E4] px-4 py-1.5 rounded-full text-xs font-bold shadow-lg text-[#1C1917]">Coming Soon</span>
              </div>
            </div>
            
          </div>
          
        </div>

        {/* --- PREMIUM FOOTER --- */}
        <footer className="mt-auto text-center pt-10 pb-4 text-xs text-[#57534E] font-medium tracking-wide uppercase opacity-70">
          Advanced editing options Coming soon
        </footer>
      </main>
    </div>
  );
}