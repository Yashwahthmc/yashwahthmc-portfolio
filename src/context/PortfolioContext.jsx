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
const defaultPersonalInfo = {
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
    const unsubExp = onSnapshot(collection(db, 'experiences'), snap => {
      setExperiences(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubProj = onSnapshot(collection(db, 'projects'), snap => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubDocs = onSnapshot(collection(db, 'documents'), snap => {
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubCerts = onSnapshot(collection(db, 'certificates'), snap => {
      setCertificates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubExp();
      unsubProj();
      unsubDocs();
      unsubCerts();
    };
  }, []);

  // ─── AUTH STATE OBSERVER ───────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─── SETTERS that ALSO write to Firestore ─────────────────────────────────
  const setPersonalInfo = async (data) => {
    setPersonalInfoState(data);
    await setDoc(doc(db, 'portfolio', 'personalInfo'), data);
  };

  const setAboutInfo = async (data) => {
    setAboutInfoState(data);
    await setDoc(doc(db, 'portfolio', 'aboutInfo'), data);
  };

  const setSocialLinks = async (data) => {
    setSocialLinksState(data);
    await setDoc(doc(db, 'portfolio', 'socialLinks'), data);
  };

  // ─── COLLECTION CRUD HELPERS ──────────────────────────────────────────────
  const addExperience = async (exp) => {
    await addDoc(collection(db, 'experiences'), exp);
  };
  const deleteExperience = async (id) => {
    await deleteDoc(doc(db, 'experiences', id));
  };

  const addProject = async (proj) => {
    await addDoc(collection(db, 'projects'), proj);
  };
  const deleteProject = async (id) => {
    await deleteDoc(doc(db, 'projects', id));
  };

  const addDocument = async (document) => {
    await addDoc(collection(db, 'documents'), document);
  };
  const deleteDocument = async (id) => {
    await deleteDoc(doc(db, 'documents', id));
  };

  const addCertificate = async (cert) => {
    await addDoc(collection(db, 'certificates'), cert);
  };
  const deleteCertificate = async (id) => {
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
