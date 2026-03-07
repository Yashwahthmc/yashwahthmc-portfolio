import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const PortfolioContext = createContext();

export const usePortfolio = () => useContext(PortfolioContext);

// ─── DEFAULT DATA (used only if Firestore is empty at first launch) ───────────
export const defaultPersonalInfo = {
  name: 'Vairamuthu',
  brandName: 'VM',
  heroImage: 'https://raw.githubusercontent.com/ahampriyanshu/ahampriyanshu/master/assets/coder.gif',
  titles: ['Frontend Developer', 'UI/UX Designer', 'Software Engineer'],
  description: 'I build interactive, responsive, and performance-optimized digital experiences.',
  resumeLink: '/resume.pdf'
};

const defaultAboutInfo = {
  description: "I am a dedicated software developer with a strong focus on creating highly interactive, scalable, and visually stunning web applications.\n\nMy goal is to always build solutions that not only solve complex problems but also provide an intuitive and delightful experience for end-users.",
  skills: [
    { id: 1, category: "Frontend", items: "React.js, Next.js, Vue.js, Tailwind CSS, Redux" },
    { id: 2, category: "Backend", items: "Node.js, Express, Python, MongoDB, PostgreSQL" },
    { id: 3, category: "Tools & DevOps", items: "Git, Docker, AWS, Vercel, Figma" }
  ]
};

const defaultSocialLinks = {
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  twitter: 'https://twitter.com',
  email: 'admin@portfolio.com'
};

// ─── HELPER: read a Firestore doc and fall back to defaults ──────────────────
async function loadDoc(docPath, defaults) {
  try {
    const pathParts = docPath.split('/');
    const snap = await getDoc(doc(db, ...pathParts));
    if (snap.exists()) {
      const data = snap.data();
      // Ensure titles is always an array (Firestore may store it differently)
      if (data.titles && !Array.isArray(data.titles)) {
        data.titles = [data.titles];
      }
      return { ...defaults, ...data };
    }
    await setDoc(doc(db, ...pathParts), defaults);
    return defaults;
  } catch (e) {
    console.error('Firestore loadDoc error (is Firestore enabled in Firebase Console?):', e);
    return defaults;
  }
}

// ─── HELPER: read a Firestore collection ─────────────────────────────────────
async function loadCollection(col) {
  const snap = await getDocs(collection(db, col));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export const PortfolioProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const [personalInfo, setPersonalInfoState] = useState(defaultPersonalInfo);
  const [aboutInfo, setAboutInfoState] = useState(defaultAboutInfo);
  const [socialLinks, setSocialLinksState] = useState(defaultSocialLinks);
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── LOAD ALL DATA FROM FIRESTORE ON MOUNT ─────────────────────────────────
  useEffect(() => {
    const isOffline = import.meta.env.VITE_OFFLINE_MODE === 'true';
    
    // Initialize unsub variables with empty functions to avoid cleanup errors in offline mode
    let unsubExp = () => {};
    let unsubProj = () => {};
    let unsubDocs = () => {};
    let unsubCerts = () => {};

    if (!isOffline) {
      const init = async () => {
        try {
          const [pi, ai, sl] = await Promise.all([
            loadDoc('portfolio/personalInfo', defaultPersonalInfo),
            loadDoc('portfolio/aboutInfo', defaultAboutInfo),
            loadDoc('portfolio/socialLinks', defaultSocialLinks),
          ]);
          setPersonalInfoState(pi);
          setAboutInfoState({ ...defaultAboutInfo, ...ai });
          setSocialLinksState(sl);
        } catch (e) {
          console.error('Error loading data from Firestore:', e);
          console.warn('Using default data as fallback. Make sure Firestore is enabled in Firebase Console.');
        } finally {
          setLoading(false);
        }
      };
      init();

      // Real-time listeners for collections
      unsubExp = onSnapshot(collection(db, 'experiences'), snap => {
        setExperiences(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      unsubProj = onSnapshot(collection(db, 'projects'), snap => {
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      unsubDocs = onSnapshot(collection(db, 'documents'), snap => {
        setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      unsubCerts = onSnapshot(collection(db, 'certificates'), snap => {
        setCertificates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    } else {
      console.log('Running in OFFLINE mode (Firebase bypassed)');
      setPersonalInfoState(defaultPersonalInfo);
      setAboutInfoState(defaultAboutInfo);
      setSocialLinksState(defaultSocialLinks);
      setLoading(false);
    }

    return () => {
      unsubExp();
      unsubProj();
      unsubDocs();
      unsubCerts();
    };
  }, []);

  // ─── AUTH STATE OBSERVER ───────────────────────────────────────────────────
  useEffect(() => {
    const isOffline = import.meta.env.VITE_OFFLINE_MODE === 'true';
    if (isOffline) {
       // In offline mode, provide a mock user so dashboard is accessible
       setUser({ email: 'admin@portfolio.com', uid: 'offline-admin' });
       setAuthLoading(false);
       return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─── SETTERS that ALSO write to Firestore ─────────────────────────────────
  const setPersonalInfo = async (data) => {
    setPersonalInfoState(data);
    if (import.meta.env.VITE_OFFLINE_MODE !== 'true') {
      await setDoc(doc(db, 'portfolio', 'personalInfo'), data);
    }
  };

  const setAboutInfo = async (data) => {
    setAboutInfoState(data);
    if (import.meta.env.VITE_OFFLINE_MODE !== 'true') {
      await setDoc(doc(db, 'portfolio', 'aboutInfo'), data);
    }
  };

  const setSocialLinks = async (data) => {
    setSocialLinksState(data);
    if (import.meta.env.VITE_OFFLINE_MODE !== 'true') {
      await setDoc(doc(db, 'portfolio', 'socialLinks'), data);
    }
  };

  // ─── COLLECTION CRUD HELPERS ──────────────────────────────────────────────
  const addExperience = async (exp) => {
    if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
      setExperiences(prev => [...prev, { id: Date.now().toString(), ...exp }]);
      return;
    }
    await addDoc(collection(db, 'experiences'), exp);
  };
  const deleteExperience = async (id) => {
    if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
      setExperiences(prev => prev.filter(item => item.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'experiences', id));
  };

  const addProject = async (proj) => {
    if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
      setProjects(prev => [...prev, { id: Date.now().toString(), ...proj }]);
      return;
    }
    await addDoc(collection(db, 'projects'), proj);
  };
  const deleteProject = async (id) => {
    if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
      setProjects(prev => prev.filter(item => item.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'projects', id));
  };

  const addDocument = async (docObj) => {
    if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
      setDocuments(prev => [...prev, { id: Date.now().toString(), ...docObj }]);
      return;
    }
    await addDoc(collection(db, 'documents'), docObj);
  };
  const deleteDocument = async (id) => {
    if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
      setDocuments(prev => prev.filter(item => item.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'documents', id));
  };

  const addCertificate = async (cert) => {
    if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
      setCertificates(prev => [...prev, { id: Date.now().toString(), ...cert }]);
      return;
    }
    await addDoc(collection(db, 'certificates'), cert);
  };
  const deleteCertificate = async (id) => {
    if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
      setCertificates(prev => prev.filter(item => item.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'certificates', id));
  };

  return (
    <PortfolioContext.Provider value={{
      loading,
      authLoading,
      user,
      personalInfo, setPersonalInfo,
      aboutInfo, setAboutInfo,
      socialLinks, setSocialLinks,
      experiences, setExperiences,
      addExperience, deleteExperience,
      projects, setProjects,
      addProject, deleteProject,
      documents, setDocuments,
      addDocument, deleteDocument,
      certificates, setCertificates,
      addCertificate, deleteCertificate,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};
