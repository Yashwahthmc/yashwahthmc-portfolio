import React, { useState } from 'react';
import { 
  ShieldAlert, Plus, Save, Trash2, FileText, Image as ImageIcon, 
  Home, User, Briefcase, Code, LogOut, Link2, Eye
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Dashboard.css';

// Max file sizes
const MAX_IMAGE_SIZE_MB = 5;
const MAX_DOC_SIZE_MB = 10;
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_DOC_SIZE = MAX_DOC_SIZE_MB * 1024 * 1024;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [saving, setSaving] = useState(false);
  const {
    personalInfo, setPersonalInfo,
    aboutInfo, setAboutInfo,
    experiences,
    addExperience, deleteExperience,
    projects,
    addProject, deleteProject,
    documents,
    addDocument, deleteDocument,
    certificates,
    addCertificate, deleteCertificate,
    socialLinks, setSocialLinks
  } = usePortfolio();

  // Local state for bio (prevents Firebase write on every keystroke)
  const [bioLocal, setBioLocal] = React.useState(null);
  const getBio = () => bioLocal !== null ? bioLocal : aboutInfo.description;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // ProtectedRoute will automatically redirect to Login
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleImageUpload = (e, setter, maxSize = MAX_IMAGE_SIZE, maxLabel = `${MAX_IMAGE_SIZE_MB}MB`) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > maxSize) {
        alert(`⚠️ File too large! Maximum allowed size is ${maxLabel}. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload for documents (PDF, DOC, etc.) with higher size limit
  const handleDocUpload = (e, setter) => {
    handleImageUpload(e, setter, MAX_DOC_SIZE, `${MAX_DOC_SIZE_MB}MB`);
  };

  // Handle certificate file upload — images or PDFs
  const handleCertFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_DOC_SIZE) {
      alert(`⚠️ File too large! Maximum allowed size is ${MAX_DOC_SIZE_MB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (file.type === 'application/pdf') {
        setNewCertImage(''); // clear image if PDF is uploaded
        setNewCertPdf(result);
      } else {
        setNewCertPdf(''); // clear PDF if image is uploaded
        setNewCertImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHomeUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await setPersonalInfo(personalInfo);
    setSaving(false);
    alert('✅ Home info saved to the cloud!');
  };

  // --- SOCIAL LINKS HANDLERS ---
  const handleLinksUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await setSocialLinks(socialLinks);
    setSaving(false);
    alert('✅ Social links saved to the cloud!');
  };

  // --- ABOUT HANDLERS ---
  const handleAboutUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await setAboutInfo({ ...aboutInfo, description: getBio(), skills: getSkills() });
    setBioLocal(null);
    setSkillsLocal(null);
    setSaving(false);
    alert('✅ About info saved to the cloud!');
  };

  // --- EXPERIENCE HANDLERS ---
  const [newSkillCat, setNewSkillCat] = useState('');
  const [newSkillItems, setNewSkillItems] = useState('');
  const [skillsLocal, setSkillsLocal] = useState(null); // null = use aboutInfo.skills

  const getSkills = () => skillsLocal !== null ? skillsLocal : aboutInfo.skills;

  const handleSaveSkills = async () => {
    const updatedAbout = { ...aboutInfo, skills: getSkills() };
    setSaving(true);
    await setAboutInfo(updatedAbout);
    setSkillsLocal(null);
    setSaving(false);
    alert('✅ Skills saved to the cloud!');
  };

  const handleAddSkill = () => {
    if (!newSkillCat) return;
    const updated = [...getSkills(), { id: Date.now(), category: newSkillCat, items: newSkillItems }];
    setSkillsLocal(updated);
    setNewSkillCat(''); setNewSkillItems('');
  };

  const handleDeleteSkill = (id) => {
    setSkillsLocal(getSkills().filter(s => s.id !== id));
  };

  // --- EXPERIENCE HANDLERS ---
  const [newExp, setNewExp] = useState({ role: '', company: '', duration: '', description: '', certificateName: '', certificateUrl: '' });
  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!newExp.role || !newExp.company) return;
    await addExperience(newExp);
    setNewExp({ role: '', company: '', duration: '', description: '', certificateName: '', certificateUrl: '' });
  };
  const handleDeleteExperience = (id) => deleteExperience(id);

  // --- PROJECTS HANDLERS ---
  const [newProj, setNewProj] = useState({ title: '', description: '', tech: '', liveLink: '', githubLink: '', image: '' });
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProj.title || !newProj.description) return;
    await addProject(newProj);
    setNewProj({ title: '', description: '', tech: '', liveLink: '', githubLink: '', image: '' });
  };
  const handleDeleteProject = (id) => deleteProject(id);

  // --- DOCUMENTS / CERTS HANDLERS ---
  const [newTitle, setNewTitle] = useState('');
  const [newIssuer, setNewIssuer] = useState('');
  const [newCertUrl, setNewCertUrl] = useState('');
  const [newCertImage, setNewCertImage] = useState('');
  const [newCertPdf, setNewCertPdf] = useState('');
  const [previewPdf, setPreviewPdf] = useState(null);
  const [newDocUrl, setNewDocUrl] = useState('');
  
  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    await addDocument({ title: newTitle, type: newDocUrl.includes('pdf') ? 'PDF' : 'DOC', url: newDocUrl });
    setNewTitle('');
    setNewDocUrl('');
    alert('✅ Document added!');
  };
  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!newTitle || !newIssuer) return;
    await addCertificate({ 
      name: newTitle, 
      issuer: newIssuer, 
      date: new Date().toISOString().split('T')[0], 
      url: newCertUrl, 
      image: newCertImage,
      pdf: newCertPdf 
    });
    setNewTitle(''); setNewIssuer(''); setNewCertUrl(''); setNewCertImage(''); setNewCertPdf('');
  };
  const handleDeleteDoc = (id) => deleteDocument(id);
  const handleDeleteCert = (id) => deleteCertificate(id);


  return (
    <div className="section animate-fade-in dashboard-section" style={{ paddingTop: '8rem' }}>
      <div className="container">
        <div className="dashboard-header">
          <h2 className="section-title text-gradient" style={{ marginBottom: 0 }}>Admin Dashboard</h2>
          <div className="admin-badge">
            <ShieldAlert size={16} /> Authenticated Secure Session
          </div>
        </div>

        <div className="dashboard-grid glass-card">
          {/* SIDEBAR */}
          <div className="sidebar">
            <button className={`sidebar-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              <Home size={20} /> Home Settings
            </button>
            <button className={`sidebar-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
              <User size={20} /> About Section
            </button>
            <button className={`sidebar-btn ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>
              <Link2 size={20} /> Social Links
            </button>
            <button className={`sidebar-btn ${activeTab === 'experience' ? 'active' : ''}`} onClick={() => setActiveTab('experience')}>
              <Briefcase size={20} /> Work Experience
            </button>
            <button className={`sidebar-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
              <Code size={20} /> Portfolio Projects
            </button>
            <button className={`sidebar-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
              <FileText size={20} /> Documents
            </button>
            <button className={`sidebar-btn ${activeTab === 'certificates' ? 'active' : ''}`} onClick={() => setActiveTab('certificates')}>
              <ImageIcon size={20} /> Certificates
            </button>

            <div className="sidebar-footer">
              <button className="btn btn-outline" style={{width: '100%'}} onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="dashboard-content">

            {/* ------------ HOME TAB ------------ */}
            {activeTab === 'home' && (
              <div className="tab-pane animate-fade-in">
                <h3>Home Setup</h3>
                <p className="subtitle">Configure your name, greeting titles, and introductory description.</p>
                <form className="add-form glass-card" onSubmit={handleHomeUpdate}>
                  <div className="form-group">
                    <label>Brand Logo Name</label>
                    <input 
                      type="text" 
                      value={personalInfo.brandName} 
                      onChange={(e) => setPersonalInfo({...personalInfo, brandName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile/Hero Image</label>
                    <div className="form-row">
                      <input 
                        type="text" 
                        placeholder="Image URL"
                        value={personalInfo.heroImage} 
                        onChange={(e) => setPersonalInfo({...personalInfo, heroImage: e.target.value})}
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (res) => setPersonalInfo({...personalInfo, heroImage: res}))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={personalInfo.name} 
                      onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Typewriter Prefix (e.g. Developing, Building)</label>
                    <input 
                      type="text" 
                      placeholder="Developing"
                      value={personalInfo.typewriterPrefix || ''} 
                      onChange={(e) => setPersonalInfo({...personalInfo, typewriterPrefix: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Animated Titles (comma separated)</label>
                    <input 
                      type="text" 
                      value={personalInfo.titles.join(', ')} 
                      onChange={(e) => setPersonalInfo({...personalInfo, titles: e.target.value.split(',').map(t=>t.trim())})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Short Description</label>
                    <textarea 
                      rows="3"
                      value={personalInfo.description} 
                      onChange={(e) => setPersonalInfo({...personalInfo, description: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary"><Save size={18}/> Save Changes</button>
                </form>
              </div>
            )}

            {/* ------------ ABOUT TAB ------------ */}
            {activeTab === 'about' && (
              <div className="tab-pane animate-fade-in">
                <h3>About Information</h3>
                <p className="subtitle">Update your bio, photo, and technical skills matrix.</p>
                <form className="add-form glass-card" onSubmit={handleAboutUpdate} style={{marginBottom: '2rem'}}>
                  <div className="form-group">
                    <label>About Section Photo</label>
                    <div className="form-row">
                      <input 
                        type="text" 
                        placeholder="Image URL"
                        value={aboutInfo.aboutImage || ''} 
                        onChange={(e) => setAboutInfo({...aboutInfo, aboutImage: e.target.value})}
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (res) => setAboutInfo({...aboutInfo, aboutImage: res}))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Detailed Bio</label>
                    <textarea 
                      rows="6"
                      value={getBio()} 
                      onChange={(e) => setBioLocal(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}><Save size={18}/> {saving ? 'Saving...' : 'Save Changes'}</button>
                </form>

                <h4 style={{marginBottom: '1rem'}}>Skill Categories</h4>
                <div className="add-form glass-card" style={{marginBottom: '1.5rem', padding: '1.5rem'}}>
                  <h5 style={{marginBottom: '1rem', color: 'var(--primary-color)'}}>Add New Skill Category</h5>
                  <div className="form-row">
                    <input type="text" placeholder="Category (e.g. Frontend)" value={newSkillCat} onChange={e => setNewSkillCat(e.target.value)} />
                    <input type="text" placeholder="Tags (comma separated)" value={newSkillItems} onChange={e => setNewSkillItems(e.target.value)} />
                    <button type="button" onClick={handleAddSkill} className="btn btn-primary"><Plus size={18} /> Add</button>
                  </div>
                </div>
                <div className="items-list">
                  {getSkills().map((skill, index) => (
                    <div key={skill.id} className="list-item" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                      <div className="form-group w-full">
                        <label>Category {index+1}</label>
                        <input 
                          type="text" 
                          value={skill.category}
                          onChange={(e) => {
                            const updated = [...getSkills()];
                            updated[index] = {...updated[index], category: e.target.value};
                            setSkillsLocal(updated);
                          }}
                        />
                      </div>
                      <div className="form-group w-full" style={{marginTop:'0.5rem'}}>
                        <label>Tags (comma separated)</label>
                        <input 
                          type="text" 
                          value={skill.items}
                          onChange={(e) => {
                            const updated = [...getSkills()];
                            updated[index] = {...updated[index], items: e.target.value};
                            setSkillsLocal(updated);
                          }}
                        />
                      </div>
                      <button type="button" onClick={() => handleDeleteSkill(skill.id)} className="action-btn delete" style={{marginTop:'0.5rem'}}><Trash2 size={14} /> Remove Category</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleSaveSkills} className="btn btn-primary" style={{marginTop:'1rem'}} disabled={saving}>
                  <Save size={18}/> {saving ? 'Saving...' : 'Save All Skills'}
                </button>
              </div>
            )}

            {/* ------------ LINKS TAB ------------ */}
            {activeTab === 'links' && (
              <div className="tab-pane animate-fade-in">
                <h3>Social & Platform Links</h3>
                <p className="subtitle">Manage the URLs for your social media and contact buttons.</p>
                <form className="add-form glass-card" onSubmit={handleLinksUpdate}>
                  <div className="form-group">
                    <label>GitHub Profile URL</label>
                    <input 
                      type="url" 
                      value={socialLinks.github} 
                      onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>LinkedIn Profile URL</label>
                    <input 
                      type="url" 
                      value={socialLinks.linkedin} 
                      onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Twitter/X Profile URL</label>
                    <input 
                      type="url" 
                      value={socialLinks.twitter} 
                      onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Email Address</label>
                    <input 
                      type="email" 
                      value={socialLinks.email} 
                      onChange={(e) => setSocialLinks({...socialLinks, email: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary"><Save size={18}/> Save Links</button>
                </form>
              </div>
            )}

            {/* ------------ EXPERIENCE TAB ------------ */}
            {activeTab === 'experience' && (
              <div className="tab-pane animate-fade-in">
                <h3>Work Experience</h3>
                <p className="subtitle">Manage your professional career timeline.</p>
                
                <form className="add-form glass-card" onSubmit={handleAddExperience}>
                  <h4>Add Experience</h4>
                  <div className="form-row">
                    <input type="text" placeholder="Job Role..." value={newExp.role} onChange={e=>setNewExp({...newExp, role: e.target.value})} required/>
                    <input type="text" placeholder="Company..." value={newExp.company} onChange={e=>setNewExp({...newExp, company: e.target.value})} required/>
                    <input type="text" placeholder="Duration (e.g. 2021 - 2023)" value={newExp.duration} onChange={e=>setNewExp({...newExp, duration: e.target.value})}/>
                  </div>
                  <div className="form-row" style={{marginTop:'1rem'}}>
                    <input type="text" placeholder="Certificate Name (Optional)" value={newExp.certificateName} onChange={e=>setNewExp({...newExp, certificateName: e.target.value})}/>
                    <input type="text" placeholder="Certificate Link URL (Optional)" value={newExp.certificateUrl} onChange={e=>setNewExp({...newExp, certificateUrl: e.target.value})}/>
                  </div>
                  <div className="form-group" style={{marginTop:'1rem'}}>
                    <textarea placeholder="Job description..." rows="3" value={newExp.description} onChange={e=>setNewExp({...newExp, description: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}}><Plus size={18} /> Add Entry</button>
                </form>

                <div className="items-list">
                  <h4>Existing Experience</h4>
                  {experiences.map(exp => (
                    <div key={exp.id} className="list-item">
                      <div className="item-info">
                        <Briefcase size={20} className="item-icon" />
                        <div>
                          <strong>{exp.role}</strong> at <span>{exp.company}</span>
                          <div className="item-date">{exp.duration}</div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteExperience(exp.id)} className="action-btn delete"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ------------ PROJECTS TAB ------------ */}
            {activeTab === 'projects' && (
              <div className="tab-pane animate-fade-in">
                <h3>Portfolio Projects</h3>
                <p className="subtitle">Manage the projects displayed on your portfolio grid.</p>
                
                <form className="add-form glass-card" onSubmit={handleAddProject}>
                  <h4>Add New Project</h4>
                  <div className="form-row">
                    <input type="text" placeholder="Project Title" value={newProj.title} onChange={e=>setNewProj({...newProj, title: e.target.value})} required/>
                    <input type="text" placeholder="Tech Stack (comma separated)" value={newProj.tech} onChange={e=>setNewProj({...newProj, tech: e.target.value})}/>
                  </div>
                  <div className="form-row" style={{marginTop: '1rem'}}>
                    <input type="text" placeholder="Live Demo URL" value={newProj.liveLink} onChange={e=>setNewProj({...newProj, liveLink: e.target.value})}/>
                    <input type="text" placeholder="Github URL" value={newProj.githubLink} onChange={e=>setNewProj({...newProj, githubLink: e.target.value})}/>
                  </div>
                  <div className="form-row" style={{marginTop: '1rem'}}>
                    <input style={{flex: 1}} type="text" placeholder="Project Image URL (e.g., https://...)" value={newProj.image} onChange={e=>setNewProj({...newProj, image: e.target.value})}/>
                    <input style={{flex: 1}} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (res) => setNewProj({...newProj, image: res}))} />
                  </div>
                  <div className="form-group" style={{marginTop:'1rem'}}>
                    <textarea placeholder="Project description..." rows="3" value={newProj.description} onChange={e=>setNewProj({...newProj, description: e.target.value})} required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}}><Plus size={18} /> Add Project</button>
                </form>

                <div className="items-list">
                  <h4>Existing Projects</h4>
                  {projects.map(proj => (
                    <div key={proj.id} className="list-item">
                      <div className="item-info">
                        {proj.image ? (
                           <img src={proj.image} alt={proj.title} className="item-thumbnail" />
                        ) : (
                           <Code size={20} className="item-icon" />
                        )}
                        <div>
                          <strong>{proj.title}</strong>
                          <div className="item-date" style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px'}}>{proj.description}</div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteProject(proj.id)} className="action-btn delete"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ------------ DOCUMENTS TAB ------------ */}
            {activeTab === 'documents' && (
              <div className="tab-pane animate-fade-in">
                <h3>Manage Documents</h3>
                <p className="subtitle">Upload resumes, cover letters, and other downloadable files.</p>
                <form onSubmit={handleAddDoc} className="add-form glass-card">
                  <h4>Add Document</h4>
                  <div className="form-row">
                    <input type="text" placeholder="Document Title (e.g. My Resume)" value={newTitle} onChange={e=>setNewTitle(e.target.value)} required/>
                    <input type="text" placeholder="External Link (Optional)" value={newDocUrl} onChange={e=>setNewDocUrl(e.target.value)} />
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleDocUpload(e, setNewDocUrl)} />
                    <button type="submit" className="btn btn-primary"><Plus size={18} /> Add Document</button>
                  </div>
                </form>
                <div className="items-list">
                  {documents.map(doc => (
                     <div key={doc.id} className="list-item">
                     <div className="item-info">
                       <FileText size={20} className="item-icon" />
                       <div>
                         <strong>{doc.title}</strong>
                         <span className="item-badge">{doc.type}</span>
                       </div>
                     </div>
                     <button onClick={() => handleDeleteDoc(doc.id)} className="action-btn delete"><Trash2 size={16} /></button>
                   </div>
                  ))}
                </div>
              </div>
            )}

            {/* ------------ CERTIFICATES TAB ------------ */}
            {activeTab === 'certificates' && (
               <div className="tab-pane animate-fade-in">
               <h3>Manage Certificates</h3>
               <p className="subtitle">Add your professional certifications.</p>
               <form onSubmit={handleAddCert} className="add-form glass-card">
                 <h4>Add Certificate</h4>
                 <div className="form-row">
                   <input type="text" placeholder="Certificate Name" value={newTitle} onChange={e=>setNewTitle(e.target.value)} required/>
                   <input type="text" placeholder="Issuer (e.g. AWS)" value={newIssuer} onChange={e=>setNewIssuer(e.target.value)} required/>
                 </div>
                 <div className="form-row" style={{marginTop:'1rem'}}>
                   <input type="text" placeholder="Certificate Link/URL (Optional)" value={newCertUrl} onChange={e=>setNewCertUrl(e.target.value)} />
                   <div style={{display:'flex', flex:1, gap:'1rem'}}>
                     <input style={{flex:1}} type="text" placeholder="Image URL (Optional)" value={newCertImage} onChange={e=>{setNewCertImage(e.target.value); setNewCertPdf('');}} />
                     <input style={{flex:1}} type="file" accept="image/*,application/pdf" onChange={handleCertFileUpload} />
                   </div>
                 </div>
                 {(newCertImage || newCertPdf) && (
                   <div className="cert-upload-preview" style={{marginTop:'1rem'}}>
                     <label style={{fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'0.5rem', display:'block'}}>Preview:</label>
                     {newCertPdf ? (
                       <div className="pdf-preview-box">
                         <FileText size={24} style={{color:'var(--primary-color)'}}/>
                         <span style={{color:'var(--text-main)', fontSize:'0.9rem'}}>PDF file attached</span>
                       </div>
                     ) : newCertImage ? (
                       <img src={newCertImage} alt="Preview" style={{maxWidth:'200px', maxHeight:'120px', borderRadius:'8px', border:'1px solid var(--card-border)'}}/>
                     ) : null}
                   </div>
                 )}
                 <button type="submit" className="btn btn-primary" style={{marginTop:'1rem'}}><Plus size={18} /> Add</button>
               </form>
               <div className="items-list">
                 {certificates.map(cert => (
                    <div key={cert.id} className="list-item">
                    <div className="item-info">
                      {cert.image ? (
                        <img src={cert.image} alt={cert.name} className="cert-thumbnail" />
                      ) : cert.pdf ? (
                        <FileText size={20} className="item-icon" style={{color:'var(--primary-color)'}} />
                      ) : (
                        <ImageIcon size={20} className="item-icon cert-icon" />
                      )}
                      <div>
                        <strong>{cert.name}</strong> • <span>{cert.issuer}</span>
                        <div className="item-date">Issued: {cert.date}</div>
                      </div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                      {cert.pdf && (
                        <button type="button" onClick={() => setPreviewPdf(previewPdf === cert.id ? null : cert.id)} className="action-btn" style={{color:'var(--primary-color)'}} title="Preview PDF">
                          <Eye size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteCert(cert.id)} className="action-btn delete"><Trash2 size={16} /></button>
                    </div>
                    {previewPdf === cert.id && cert.pdf && (
                      <div className="cert-pdf-preview" style={{width:'100%', marginTop:'1rem'}}>
                        <iframe src={cert.pdf} title={`${cert.name} PDF`} style={{width:'100%', height:'400px', border:'1px solid var(--card-border)', borderRadius:'8px', background:'#fff'}}></iframe>
                      </div>
                    )}
                  </div>
                 ))}
               </div>
             </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
