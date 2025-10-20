# React Learning Progress - Freelance Command Center

**Status:** U toku - Pauzirano na Lekciji 7
**Sledeće:** Nastaviti od Lekcije 8 - Conditional Rendering i Liste

---

## ✅ Završene Lekcije

### Lekcija 1: React Osnove - Komponente i JSX
- **Šta je React:** Biblioteka za pravljenje UI-a kroz komponente
- **Komponente:** Funkcije koje vraćaju JSX
- **JSX:** HTML-like sintaksa u JavaScript-u
- **Entry point:** `index.tsx` - `ReactDOM.createRoot()` i `root.render()`
- **Pravila JSX-a:**
  - Koristi `className` umesto `class`
  - JavaScript kod u `{}`
  - Svaki element mora imati jedan root element
  - Self-closing tagovi moraju imati `/`

**Kod za pregled:**
- [frontend/src/index.tsx](frontend/src/index.tsx)
- [frontend/src/App.tsx](frontend/src/App.tsx)

---

### Lekcija 2: Props - Kako komponente komuniciraju
- **Props:** Način da roditelj prosledi podatke detetu
- **Tok podataka:** Odozgo na dole (roditelj → dete)
- **Props su read-only:** Dete ne može da ih menja
- **TypeScript Interface:** Definisanje tipova props-a
- **Destrukturiranje:** `({ user, onLogout })` umesto `props.user`
- **Callbacks:** Prosleđivanje funkcija omogućava komunikaciju nazad

**Primeri iz koda:**
```tsx
// App prosleđuje props Navigation komponenti
<Navigation user={user} onLogout={handleLogout} />

// Navigation prima props
const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  // Koristi user i onLogout
}
```

**Kod za pregled:**
- [frontend/src/components/Navigation.tsx](frontend/src/components/Navigation.tsx)
- [frontend/src/components/Login.tsx](frontend/src/components/Login.tsx)

---

### Lekcija 3: State i useState Hook
- **State:** Memorija komponente - podaci koje komponenta kontroliše
- **useState:** Hook za kreiranje state-a
- **Sintaksa:** `const [vrednost, setVrednost] = useState(inicijalna)`
- **Re-render:** Kad se state menja, React ponovo renderuje komponentu

**Razlika Props vs State:**
| Props | State |
|-------|-------|
| Dolaze od roditelja | Žive u komponenti |
| Read-only | Mogu se menjati |
| Statični | Dinamički |

**Važna pravila:**
- ❌ NIKAD ne menjaj state direktno: `username = 'Milan'`
- ✅ UVEK koristi setter: `setUsername('Milan')`
- ❌ Ne mutiraj objekte: `user.name = 'Milan'`
- ✅ Kreiraj novi objekat: `setUser({ ...user, name: 'Milan' })`

**Primeri iz koda:**
```tsx
// Login forma
const [username, setUsername] = useState('');
const [loading, setLoading] = useState(false);

// Input polje povezano sa state
<Form.Control
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
```

**Kod za pregled:**
- [frontend/src/components/Login.tsx:11-14](frontend/src/components/Login.tsx#L11-L14)
- [frontend/src/App.tsx:16-18](frontend/src/App.tsx#L16-L18)

---

### Lekcija 4: useEffect Hook i Životni Ciklus
- **useEffect:** Hook za "side effects" (API pozivi, timeri, event listeners)
- **Tri tipa useEffect-a:**

#### 1. Izvršava se SAMO JEDNOM (mount):
```tsx
useEffect(() => {
  checkAuth();
}, []); // Prazan array
```

#### 2. Izvršava se SVAKI PUT (svaki render):
```tsx
useEffect(() => {
  console.log('Renderovano');
}); // Nema array - opasno!
```

#### 3. Izvršava se kada se vrednost promeni:
```tsx
useEffect(() => {
  loadData();
}, [userId]); // Izvršava se kad se userId promeni
```

**Cleanup funkcija:**
- `return` u useEffect je UVEK cleanup funkcija
- NE izvršava se odmah - čuva se za kasnije
- Poziva se na unmount ili pre sledećeg effect-a

**Kada treba cleanup:**
- ✅ Timeri (`setInterval`, `setTimeout`)
- ✅ Event listeners (`addEventListener`)
- ✅ Subscriptions (WebSocket, Firebase)
- ✅ Ručna DOM manipulacija
- ❌ Obični API pozivi (ne treba)
- ❌ Console log (ne treba)

**Primer sa cleanup:**
```tsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick!');
  }, 1000);

  return () => {
    clearInterval(timer); // Cleanup
  };
}, []);
```

**Životni ciklus komponente:**
1. **MOUNT** - Komponenta se prvo renderuje
2. **UPDATE** - Komponenta se ažurira (state/props se menjaju)
3. **UNMOUNT** - Komponenta se uklanja

**Kod za pregled:**
- [frontend/src/App.tsx:20-22](frontend/src/App.tsx#L20-L22)
- [frontend/src/components/Dashboard.tsx:14-16](frontend/src/components/Dashboard.tsx#L14-L16)

---

### Lekcija 5: Event Handling i Forme
- **Events:** Korisničke akcije (klik, unos teksta, submit)
- **onClick sintaksa:**

```tsx
// ✅ Referenca na funkciju
<Button onClick={handleClick}>

// ✅ Arrow funkcija sa argumentima
<Button onClick={() => handleClick(id)}>

// ❌ Poziva se odmah (greška!)
<Button onClick={handleClick()}>
```

**Event object:**
- `e.target` - Element koji je okidao event
- `e.target.value` - Vrednost input polja
- `e.target.name` - Name atribut
- `e.preventDefault()` - Spreči default ponašanje

**Kontrolisane forme:**
- State je "izvor istine"
- Input polje čita iz state-a (`value={username}`)
- Menja state preko onChange (`onChange={(e) => setUsername(e.target.value)}`)

**Object state - Spread operator:**
```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  company: ''
});

const handleChange = (e) => {
  setFormData({
    ...formData, // Kopiraj sve postojeće
    [e.target.name]: e.target.value // Zameni samo jedno polje
  });
};
```

**Form Submit:**
```tsx
const handleSubmit = (e) => {
  e.preventDefault(); // ✅ UVEK! Spreči page refresh
  // Tvoja logika...
};
```

**Kod za pregled:**
- [frontend/src/components/Login.tsx:16-31](frontend/src/components/Login.tsx#L16-L31)
- [frontend/src/components/Clients.tsx:70-75](frontend/src/components/Clients.tsx#L70-L75)

---

### Lekcija 6: React Router - Navigacija
- **React Router:** Single Page Application (SPA) - bez page refresh
- **Setup:** Wrappuj app sa `<Router>`

**Osnovni koncepti:**
```tsx
<Router>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Router>
```

**Navigacija:**
```tsx
// 1. Deklarativna - Link komponenta
import { Link } from 'react-router-dom';
<Link to="/clients">Clients</Link>

// 2. Programatska - useNavigate hook
const navigate = useNavigate();
navigate('/dashboard');
```

**Važno:**
- ✅ `<Link>` radi SAMO unutar React Router konteksta
- ✅ Za interne rute: `<Link to="/path">`
- ✅ Za eksterne URL-ove: `<a href="https://...">`
- ❌ Ne koristi `<a>` za interne rute (page refresh!)

**Protected Routes:**
```tsx
<Route
  path="/dashboard"
  element={
    isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
  }
/>
```

**Kod za pregled:**
- [frontend/src/App.tsx:69-123](frontend/src/App.tsx#L69-L123)
- [frontend/src/components/Navigation.tsx:28-39](frontend/src/components/Navigation.tsx#L28-L39)

---

### Lekcija 7: API Pozivi i Asinhrone Operacije ⏸️ (Pauzirano)

**Osnovni koncepti:**
- **Axios:** Biblioteka za HTTP zahteve
- **Async/Await:** Asinhroni kod koji izgleda kao sinhroni
- **CRUD operacije:** Create (POST), Read (GET), Update (PUT), Delete (DELETE)

**Setup - Axios instance:**
```tsx
const API_URL = 'http://3.67.201.188/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Async/Await pattern:**
```tsx
const loadClients = async () => {
  try {
    const data = await clientsAPI.getAll(); // Čeka odgovor
    setClients(data); // Postavlja state
  } catch (error) {
    console.error(error); // Hvata greške
  } finally {
    setLoading(false); // UVEK se izvršava
  }
};
```

**CRUD API funkcije:**
```tsx
export const clientsAPI = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get('/clients/');
    return response.data;
  },

  create: async (data: Partial<Client>): Promise<Client> => {
    const response = await api.post('/clients/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Client>): Promise<Client> => {
    const response = await api.put(`/clients/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}/`);
  },
};
```

**Interceptors (Napredna tema):**

1. **Request Interceptor** - Automatski dodaje token:
```tsx
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

2. **Response Interceptor** - Automatski refresh token:
```tsx
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token i ponovi zahtev
    }
    return Promise.reject(error);
  }
);
```

**Promise.all - Paralelni pozivi:**
```tsx
const [clients, timeEntries, invoices] = await Promise.all([
  clientsAPI.getAll(),
  timeEntriesAPI.getAll(),
  invoicesAPI.getAll(),
]);
// Svi pozivi istovremeno umesto jedan po jedan!
```

**Kod za pregled:**
- [frontend/src/api.ts](frontend/src/api.ts)
- [frontend/src/components/Login.tsx:16-31](frontend/src/components/Login.tsx#L16-L31)
- [frontend/src/components/Clients.tsx:24-31](frontend/src/components/Clients.tsx#L24-L31)
- [frontend/src/components/Dashboard.tsx:18-42](frontend/src/components/Dashboard.tsx#L18-L42)

**⚠️ NAPOMENA:** Detaljno proučiti Axios interceptore i error handling pre nego što nastavim!

---

## 📋 Preostale Lekcije

### Lekcija 8: Conditional Rendering i Liste (SLEDEĆA)
**Teme za učenje:**
- Conditional rendering (`&&`, ternary operator)
- Liste i `map()` funkcija
- `key` prop i zašto je važan
- Filter i sort podataka
- Prikazivanje praznih stanja

**Fajlovi za analizu:**
- [frontend/src/components/Clients.tsx:119-160](frontend/src/components/Clients.tsx#L119-L160)
- [frontend/src/components/Dashboard.tsx:54-91](frontend/src/components/Dashboard.tsx#L54-L91)

---

## 💡 Ključne Lekcije (Sažetak)

### React Fundamentals:
1. **Komponente** su funkcije koje vraćaju JSX
2. **Props** teku odozgo na dole (roditelj → dete)
3. **State** je memorija komponente
4. **useEffect** za side effects
5. **Events** za interakciju sa korisnikom

### Patterns:
```tsx
// 1. Komponenta sa state-om
function MyComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  return <div>{/* JSX */}</div>;
}

// 2. API workflow
const handleSubmit = async () => {
  setLoading(true);
  try {
    await api.post('/endpoint', formData);
    navigate('/success');
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// 3. Forme (controlled components)
<input
  value={state}
  onChange={(e) => setState(e.target.value)}
/>
```

---

## 📚 Dodatni Resursi za Učenje

- [React Official Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Router Documentation](https://reactrouter.com)

---

**Datum kreiranja:** 2025-10-20
**Poslednje ažuriranje:** Pauzirano na Lekciji 7 (Axios i API pozivi)
**Status:** 7/8 lekcija završeno (87.5%)

**Sledeći put:** Nastavi sa Lekcijom 8 - Conditional Rendering i Liste

---

# 🎓 BONUS LEKCIJE - Napredni React Koncepti

**Napomena:** Ove lekcije pokrivaju koncepte koje tvoj projekat NE koristi, ali su VEOMA važni za profesionalan React razvoj.

---

## Bonus Lekcija 1: Context API - Globalni State

### **Problem: Prop Drilling**

Kada props moraju da prolaze kroz mnogo nivoa:

```tsx
// ❌ Prop Drilling problem
function App() {
  const [user, setUser] = useState(null);
  return <Dashboard user={user} />;
}

function Dashboard({ user }) {
  return <Sidebar user={user} />;
}

function Sidebar({ user }) {
  return <UserMenu user={user} />;
}

function UserMenu({ user }) {
  return <UserAvatar user={user} />;
}

function UserAvatar({ user }) {
  return <img src={user.avatar} />;  // 5 nivoa samo da dobiješ user!
}
```

### **Rešenje: Context API**

```tsx
// 1. Kreiraj Context
import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

// 2. Kreiraj Provider komponentu
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// 3. Kreiraj custom hook
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```

**Korišćenje:**

```tsx
// App.tsx
function App() {
  return (
    <UserProvider>
      <Dashboard />
    </UserProvider>
  );
}

// UserAvatar.tsx - bilo gde u drvetu!
function UserAvatar() {
  const { user } = useUser();  // ✅ Direktan pristup!
  return <img src={user?.avatar} />;
}
```

### **Primena u tvom projektu:**

```tsx
// contexts/AuthContext.tsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (username, password) => {
    const data = await authAPI.login(username, password);
    localStorage.setItem('access_token', data.access);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Korišćenje u bilo kojoj komponenti:
function Navigation() {
  const { user, logout } = useAuth();
  return <button onClick={logout}>{user?.name}</button>;
}
```

### **Kada koristiti Context:**
- ✅ Autentifikacija (user, auth state)
- ✅ Tema (dark/light mode)
- ✅ Jezik (i18n)
- ✅ Global settings
- ❌ Često menjani podaci (performance problemi)
- ❌ Lokalni state (bolje useState)

**Resursi:**
- [React Context Docs](https://react.dev/learn/passing-data-deeply-with-context)

---

## Bonus Lekcija 2: Custom Hooks - Reusable Logika

### **Problem: Duplikacija koda**

```tsx
// Clients.tsx
function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        const data = await clientsAPI.getAll();
        setClients(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  // ...
}

// Invoices.tsx - ISTI KOD! ❌
function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // ... isti kod
}
```

### **Rešenje: Custom Hook**

```tsx
// hooks/useApi.ts
function useApi(apiCall) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Korišćenje:
function Clients() {
  const { data: clients, loading, error, refetch } = useApi(clientsAPI.getAll);

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ClientsList clients={clients} />
    </div>
  );
}
```

### **Još korisnih Custom Hooks:**

#### **useLocalStorage - Persist state**

```tsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Korišćenje:
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
    Toggle Theme
  </button>;
}
```

#### **useDebounce - Odloženo izvršavanje**

```tsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Korišćenje za search:
function SearchClients() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    // API poziv tek nakon 500ms od poslednjeg unosa
    searchClients(debouncedSearch);
  }, [debouncedSearch]);

  return <input value={search} onChange={e => setSearch(e.target.value)} />;
}
```

#### **useToggle - Boolean state**

```tsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}

// Korišćenje:
function Modal() {
  const [isOpen, toggleOpen] = useToggle(false);
  return (
    <>
      <button onClick={toggleOpen}>Open Modal</button>
      {isOpen && <ModalContent onClose={toggleOpen} />}
    </>
  );
}
```

**Resursi:**
- [usehooks.com](https://usehooks.com/) - Kolekcija custom hooks
- [React Custom Hooks Docs](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## Bonus Lekcija 3: useMemo i useCallback - Performance Optimization

### **Problem: Nepotrebni re-renderi i kalkulacije**

```tsx
function ExpensiveComponent({ data, filter }) {
  // ❌ Ova kalkulacija se izvršava SVAKI PUT kad se komponenta renderuje
  const filteredData = data.filter(item => {
    console.log('Filtering...'); // Vidi se na svakom render-u!
    return item.category === filter;
  });

  const handleClick = () => {
    console.log('Clicked');
  };

  return (
    <div>
      <ExpensiveChild onClick={handleClick} />
      {filteredData.map(item => <Item key={item.id} data={item} />)}
    </div>
  );
}
```

### **Rešenje: useMemo**

```tsx
function ExpensiveComponent({ data, filter }) {
  // ✅ Računa se SAMO kad se 'data' ili 'filter' promene
  const filteredData = useMemo(() => {
    console.log('Filtering...'); // Vidi se samo kad treba!
    return data.filter(item => item.category === filter);
  }, [data, filter]);  // Dependencies

  return (
    <div>
      {filteredData.map(item => <Item key={item.id} data={item} />)}
    </div>
  );
}
```

### **useCallback - Memoizacija funkcija**

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ Nova funkcija na svaki render
  const handleClick = () => {
    console.log('Clicked');
  };

  // ✅ Ista funkcija dok se dependencies ne promene
  const handleClickMemo = useCallback(() => {
    console.log('Clicked');
  }, []); // Prazno = nikad se ne menja

  // useCallback sa dependencies
  const handleSave = useCallback(() => {
    saveData(text);
  }, [text]); // Nova funkcija samo kad se text promeni

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveChild onClick={handleClickMemo} onSave={handleSave} />
    </div>
  );
}

// ExpensiveChild neće se re-renderovati kad Parent menja count
const ExpensiveChild = React.memo(({ onClick, onSave }) => {
  console.log('ExpensiveChild rendered');
  return <button onClick={onClick}>Child Button</button>;
});
```

### **Primena u tvom projektu:**

```tsx
// Dashboard.tsx - Kalkulacija revenue
function Dashboard() {
  const { data: invoices } = useApi(invoicesAPI.getAll);

  // ✅ Računa se samo kad se invoices promene
  const totalRevenue = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
  }, [invoices]);

  const stats = useMemo(() => ({
    totalInvoices: invoices.length,
    totalRevenue,
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length
  }), [invoices, totalRevenue]);

  return <StatsDisplay stats={stats} />;
}
```

### **Kada koristiti:**

**useMemo:**
- ✅ Teške kalkulacije (filter, map, reduce na velikim nizovima)
- ✅ Kreiranje objekata/nizova koji se prosleđuju kao props
- ❌ Jednostavne operacije (overhead je veći od koristi)

**useCallback:**
- ✅ Funkcije prosleđene memoizovanim komponentama
- ✅ Funkcije u dependency array-ima drugih hook-ova
- ❌ Event handleri u običnim komponentama (nepotrebno)

**Resursi:**
- [React useMemo Docs](https://react.dev/reference/react/useMemo)
- [React useCallback Docs](https://react.dev/reference/react/useCallback)

---

## Bonus Lekcija 4: useReducer - Kompleksni State

### **Problem: Mnogo povezanih useState-ova**

```tsx
// ❌ Teško za održavanje
function ComplexForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSearch = (query) => {
    setFilter(query);
    setPage(1);
    setLoading(true);
    setError(null);
    // 4 state update-a!
  };
}
```

### **Rešenje: useReducer**

```tsx
// 1. Definiši state i actions
const initialState = {
  loading: false,
  error: null,
  data: [],
  page: 1,
  filter: '',
  sortBy: 'name',
  sortOrder: 'asc'
};

// 2. Kreiraj reducer funkciju
function dataReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };

    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'SET_FILTER':
      return { ...state, filter: action.payload, page: 1 };

    case 'SET_PAGE':
      return { ...state, page: action.payload };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// 3. Koristi u komponenti
function ComplexForm() {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const handleSearch = (query) => {
    dispatch({ type: 'SET_FILTER', payload: query });
    // Jedan dispatch, multiple state changes!
  };

  const loadData = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await api.getData();
      dispatch({ type: 'FETCH_SUCCESS', payload: result });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  };

  return (
    <div>
      {state.loading && <Spinner />}
      {state.error && <Error message={state.error} />}
      <DataList data={state.data} />
    </div>
  );
}
```

### **Primena u tvom projektu - Clients forma:**

```tsx
// clientsReducer.ts
const initialState = {
  clients: [],
  loading: false,
  error: null,
  showModal: false,
  editingClient: null,
  formData: { name: '', email: '', company: '', address: '', pib: '' }
};

function clientsReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true };

    case 'LOAD_SUCCESS':
      return { ...state, loading: false, clients: action.payload };

    case 'SHOW_MODAL':
      return { ...state, showModal: true, editingClient: action.payload };

    case 'HIDE_MODAL':
      return {
        ...state,
        showModal: false,
        editingClient: null,
        formData: initialState.formData
      };

    case 'UPDATE_FORM':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload }
      };

    default:
      return state;
  }
}

// Clients.tsx
function Clients() {
  const [state, dispatch] = useReducer(clientsReducer, initialState);

  const handleShowModal = (client) => {
    dispatch({ type: 'SHOW_MODAL', payload: client });
  };

  const handleChange = (e) => {
    dispatch({
      type: 'UPDATE_FORM',
      payload: { [e.target.name]: e.target.value }
    });
  };

  return <div>...</div>;
}
```

### **useState vs useReducer:**

| useState | useReducer |
|----------|------------|
| Jednostavan state | Kompleksan state |
| Nekoliko vrednosti | Mnogo povezanih vrednosti |
| Jednostavne promene | Kompleksna logika |
| `setCount(count + 1)` | `dispatch({ type: 'INCREMENT' })` |

**Kada koristiti useReducer:**
- ✅ State sa mnogo povezanih vrednosti
- ✅ State transitions (state machine logika)
- ✅ Složena update logika
- ✅ Kad želiš da testiraš state logiku odvojeno

**Resursi:**
- [React useReducer Docs](https://react.dev/reference/react/useReducer)

---

## Bonus Lekcija 5: React.memo - Component Memoization

### **Problem: Nepotrebni re-renderi**

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveChild />  {/* ❌ Re-renderuje se svaki put kad Parent se renderuje! */}
    </div>
  );
}

function ExpensiveChild() {
  console.log('ExpensiveChild rendered'); // Vidi se na svaki Parent render
  // ... kompleksna logika ...
  return <div>Expensive Component</div>;
}
```

### **Rešenje: React.memo**

```tsx
// ✅ Memoizovana komponenta - renderuje se samo kad props promene
const ExpensiveChild = React.memo(() => {
  console.log('ExpensiveChild rendered'); // Samo kad props promene
  return <div>Expensive Component</div>;
});

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveChild />  {/* ✅ Neće se re-renderovati! */}
    </div>
  );
}
```

### **Sa props-ima:**

```tsx
const UserCard = React.memo(({ user }) => {
  console.log('UserCard rendered');
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

// Custom comparison funkcija
const UserCardAdvanced = React.memo(
  ({ user, settings }) => {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Vraća true ako su props ISTI (ne re-renderuj)
    // Vraća false ako su props RAZLIČITI (re-renderuj)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### **Kombinacija sa useCallback:**

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState([]);

  // ❌ Nova funkcija na svaki render - memo ne radi!
  const handleUserClick = (userId) => {
    console.log(userId);
  };

  // ✅ Ista funkcija - memo radi!
  const handleUserClickMemo = useCallback((userId) => {
    console.log(userId);
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <UserList users={users} onClick={handleUserClickMemo} />
    </div>
  );
}

const UserList = React.memo(({ users, onClick }) => {
  console.log('UserList rendered');
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} onClick={() => onClick(user.id)} />
      ))}
    </div>
  );
});
```

### **Kada koristiti:**

**✅ Koristi React.memo kad:**
- Komponenta se često renderuje sa istim props-ima
- Komponenta ima skupe kalkulacije/rendering
- Komponenta renderuje veliku listu

**❌ Ne koristi React.memo kad:**
- Props se često menjaju (overhead je veći od koristi)
- Komponenta je već brza
- Preuranjena optimizacija (prvo izmeri, pa optimizuj!)

**Resursi:**
- [React.memo Docs](https://react.dev/reference/react/memo)

---

## Bonus Lekcija 6: useRef - Direktan pristup DOM-u i vrednostima

### **Dva glavna use case-a:**

#### **1. Pristup DOM elementima**

```tsx
function FocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    // Fokusiraj input kad komponenta mountuje
    inputRef.current.focus();
  }, []);

  const handleClick = () => {
    // Fokusiraj programski
    inputRef.current.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleClick}>Focus Input</button>
    </div>
  );
}
```

#### **2. Čuvanje vrednosti koja NE triggeruje re-render**

```tsx
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  const startTimer = () => {
    if (intervalRef.current) return; // Već radi

    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    return () => {
      // Cleanup - zaustavi timer na unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}
```

### **useRef vs useState:**

```tsx
function Example() {
  const [stateValue, setStateValue] = useState(0);  // Triggeruje re-render
  const refValue = useRef(0);  // NE triggeruje re-render

  const handleClick = () => {
    // ✅ Re-renderuje komponentu
    setStateValue(stateValue + 1);

    // ✅ NE re-renderuje komponentu
    refValue.current = refValue.current + 1;
    console.log('Ref:', refValue.current); // Nova vrednost odmah
  };

  return (
    <div>
      <p>State: {stateValue}</p>
      <p>Ref: {refValue.current}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}
```

### **Čuvanje prethodne vrednosti:**

```tsx
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Korišćenje:
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### **Scroll to element:**

```tsx
function ScrollToSection() {
  const sectionRef = useRef(null);

  const scrollToSection = () => {
    sectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <button onClick={scrollToSection}>Scroll Down</button>
      <div style={{ height: '1000px' }}>...</div>
      <div ref={sectionRef}>Target Section</div>
    </div>
  );
}
```

**Resursi:**
- [React useRef Docs](https://react.dev/reference/react/useRef)

---

## Bonus Lekcija 7: Error Boundaries - Hvatanje grešaka

### **Problem: Komponenta crashuje = cela app pada**

```tsx
function BuggyComponent() {
  const [count, setCount] = useState(0);

  if (count === 5) {
    throw new Error('I crashed!'); // 💥 Cela app pada!
  }

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### **Rešenje: Error Boundary**

**Napomena:** Error Boundaries mogu biti samo **class komponente** (za sada).

```tsx
// ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state kad se error desi
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Možeš logovati error u error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    // Primer: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return this.props.fallback || (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### **Korišćenje:**

```tsx
// App.tsx
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Navigation />
        <ErrorBoundary fallback={<div>Dashboard error</div>}>
          <Dashboard />
        </ErrorBoundary>
        <ErrorBoundary fallback={<div>Clients error</div>}>
          <Clients />
        </ErrorBoundary>
      </Router>
    </ErrorBoundary>
  );
}

// Sada ako Clients komponenta crashuje, samo Clients deo pada,
// ne cela aplikacija!
```

### **Granularni Error Boundaries:**

```tsx
// Wrappuj svaku rutu
<Routes>
  <Route
    path="/dashboard"
    element={
      <ErrorBoundary>
        <Dashboard />
      </ErrorBoundary>
    }
  />
  <Route
    path="/clients"
    element={
      <ErrorBoundary>
        <Clients />
      </ErrorBoundary>
    }
  />
</Routes>
```

### **Error Boundary sa retry logikom:**

```tsx
class ErrorBoundaryWithRetry extends Component {
  state = { hasError: false, errorCount: 0 };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(state => ({ errorCount: state.errorCount + 1 }));

    if (this.state.errorCount < 3) {
      // Auto-retry do 3 puta
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError && this.state.errorCount >= 3) {
      return <div>Too many errors. Please refresh the page.</div>;
    }

    return this.props.children;
  }
}
```

### **Šta Error Boundaries HVATA:**

✅ **Hvata:**
- Errors u render metodi
- Errors u lifecycle metodama
- Errors u constructorima child komponenti

❌ **NE HVATA:**
- Event handlers (koristi try/catch)
- Asinhroni kod (setTimeout, Promise)
- Server-side rendering errors
- Errors u samom error boundary

### **Za event handlers - koristi try/catch:**

```tsx
function MyComponent() {
  const handleClick = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      console.error('Error in event handler:', error);
      // Prikaži error notification
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

**Resursi:**
- [Error Boundaries Docs](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

## Bonus Lekcija 8: React.lazy i Suspense - Code Splitting

### **Problem: Veliki bundle size**

```tsx
// ❌ Sve komponente se učitavaju odjednom
import Dashboard from './Dashboard';  // 500KB
import Clients from './Clients';      // 300KB
import Invoices from './Invoices';    // 400KB
import TimeEntries from './TimeEntries'; // 350KB

// bundle.js = 1.5MB! 💀
// Korisnik mora da čeka da se SVE učita, čak i za stranice koje neće posetiti
```

### **Rešenje: Code Splitting sa React.lazy**

```tsx
// ✅ Lazy loading - učitava se samo kad treba
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const Clients = lazy(() => import('./Clients'));
const Invoices = lazy(() => import('./Invoices'));
const TimeEntries = lazy(() => import('./TimeEntries'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/time-entries" element={<TimeEntries />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

// Sada:
// main.js = 200KB (base app)
// Dashboard.js = 500KB (učitava se samo kad odeš na /dashboard)
// Clients.js = 300KB (učitava se samo kad odeš na /clients)
// itd.
```

### **Bolji Spinner:**

```tsx
function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center"
         style={{ height: '100vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
```

### **Multiple Suspense boundaries:**

```tsx
function App() {
  return (
    <Router>
      <Navigation />  {/* Uvek učitano */}

      {/* Suspense za svaku rutu */}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={
            <Suspense fallback={<div>Loading clients...</div>}>
              <Clients />
            </Suspense>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### **Preload komponente:**

```tsx
const Dashboard = lazy(() => import('./Dashboard'));

// Preload na hover
function Navigation() {
  const handleMouseEnter = () => {
    // Počni da učitavaš Dashboard pre nego što korisnik klikne
    import('./Dashboard');
  };

  return (
    <Link
      to="/dashboard"
      onMouseEnter={handleMouseEnter}
    >
      Dashboard
    </Link>
  );
}
```

### **Error handling sa Suspense:**

```tsx
<ErrorBoundary fallback={<div>Failed to load component</div>}>
  <Suspense fallback={<LoadingSpinner />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

### **Benefiti Code Splitting:**

✅ **Brži initial load** - manje da se download-uje
✅ **Bolja performance** - učitava se samo što treba
✅ **Bolje korisničko iskustvo** - app se učitava brže
✅ **Manje bandwidth-a** - korisnici ne download-uju sve

### **Kada koristiti:**

- ✅ Route-based splitting (svaka ruta poseban chunk)
- ✅ Velike biblioteke (chart libraries, editors)
- ✅ Modal/Dialog komponente (učitavaj kad se otvore)
- ✅ Tab komponente (učitavaj tab kad se aktivira)
- ❌ Male komponente (overhead je veći od koristi)

**Resursi:**
- [Code Splitting Docs](https://react.dev/reference/react/lazy)

---

## Bonus Lekcija 9: React Query (TanStack Query) - Data Fetching

**Napomena:** Ovo je **MUST-HAVE** biblioteka za svaki ozbiljan React projekat!

### **Problem sa tvojim trenutnim pristupom:**

```tsx
// ❌ Ručno upravljanje svime
function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Problemi:
  // - Nema caching (svaki mount = novi API call)
  // - Nema auto-refetch
  // - Nema optimistic updates
  // - Nema retry logic
  // - Duplikacija koda u svakoj komponenti
}
```

### **Rešenje: React Query**

```bash
npm install @tanstack/react-query
```

```tsx
// main.tsx ili App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

### **Osnovno korišćenje:**

```tsx
import { useQuery } from '@tanstack/react-query';

function Clients() {
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsAPI.getAll
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <ClientsList clients={clients} />;
}

// Sve automatski:
// ✅ Caching
// ✅ Auto-refetch on window focus
// ✅ Loading states
// ✅ Error handling
// ✅ Retry logic
```

### **Mutations (Create/Update/Delete):**

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function Clients() {
  const queryClient = useQueryClient();

  // Query za dobijanje podataka
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsAPI.getAll
  });

  // Mutation za kreiranje
  const createMutation = useMutation({
    mutationFn: clientsAPI.create,
    onSuccess: () => {
      // Invalidate i refetch
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  // Mutation za brisanje
  const deleteMutation = useMutation({
    mutationFn: clientsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const handleCreate = async (formData) => {
    try {
      await createMutation.mutateAsync(formData);
      // Success!
    } catch (error) {
      // Error handling
    }
  };

  return (
    <div>
      <button onClick={() => handleCreate(data)}>
        {createMutation.isPending ? 'Creating...' : 'Create'}
      </button>
      <ClientsList
        clients={clients}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}
```

### **Optimistic Updates:**

```tsx
const updateMutation = useMutation({
  mutationFn: clientsAPI.update,
  onMutate: async (newClient) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['clients'] });

    // Snapshot previous value
    const previousClients = queryClient.getQueryData(['clients']);

    // Optimistically update
    queryClient.setQueryData(['clients'], (old) =>
      old.map((c) => (c.id === newClient.id ? newClient : c))
    );

    return { previousClients };
  },
  onError: (err, newClient, context) => {
    // Rollback on error
    queryClient.setQueryData(['clients'], context.previousClients);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  }
});
```

### **Pagination:**

```tsx
function Clients() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['clients', page],
    queryFn: () => clientsAPI.getPage(page),
    keepPreviousData: true  // Prikazuje stare podatke dok se učitavaju novi
  });

  return (
    <div>
      <ClientsList clients={data?.results} />
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)}>Next</button>
    </div>
  );
}
```

### **Dependent Queries:**

```tsx
function ClientDetails({ clientId }) {
  // Prvo dobij klijenta
  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientsAPI.get(clientId)
  });

  // Onda dobij njegove fakture (samo kad imaš client)
  const { data: invoices } = useQuery({
    queryKey: ['invoices', clientId],
    queryFn: () => invoicesAPI.getByClient(clientId),
    enabled: !!client  // Izvršava se samo kad client postoji
  });

  return <div>...</div>;
}
```

### **Auto-refetch:**

```tsx
const { data } = useQuery({
  queryKey: ['clients'],
  queryFn: clientsAPI.getAll,
  refetchInterval: 30000,  // Refetch svake 30 sekundi
  refetchOnWindowFocus: true,  // Refetch kad tab dobije focus
  refetchOnReconnect: true,  // Refetch nakon reconnect-a
  staleTime: 5000,  // Podaci su "fresh" 5 sekundi
});
```

### **Zašto je React Query game-changer:**

✅ **Dramatično manje koda** (75% manje)
✅ **Automatski caching**
✅ **Background updates**
✅ **Optimistic updates**
✅ **Pagination i infinite scroll**
✅ **Deduplikacija zahteva**
✅ **DevTools za debugging**

**Resursi:**
- [TanStack Query Docs](https://tanstack.com/query/latest)

---

## Bonus Lekcija 10: React Hook Form - Bolje forme

### **Problem sa trenutnim pristupom:**

```tsx
// ❌ Mnogo boilerplate-a
function Form() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Invalid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Submit
    }
  };

  // Mnogo koda za jednostavnu formu!
}
```

### **Rešenje: React Hook Form**

```bash
npm install react-hook-form
```

```tsx
import { useForm } from 'react-hook-form';

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);  // { name: "...", email: "..." }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { required: 'Name is required' })}
      />
      {errors.name && <span>{errors.name.message}</span>}

      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email'
          }
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### **Validacija:**

```tsx
const { register, handleSubmit, formState: { errors } } = useForm();

<input
  {...register('username', {
    required: 'Username is required',
    minLength: { value: 3, message: 'Min 3 characters' },
    maxLength: { value: 20, message: 'Max 20 characters' },
    pattern: {
      value: /^[a-zA-Z0-9]+$/,
      message: 'Only letters and numbers'
    }
  })}
/>

<input
  {...register('age', {
    required: true,
    min: { value: 18, message: 'Must be 18+' },
    max: { value: 100, message: 'Must be under 100' },
    valueAsNumber: true  // Convert to number
  })}
  type="number"
/>
```

### **Custom validacija:**

```tsx
<input
  {...register('password', {
    required: 'Password is required',
    validate: {
      hasNumber: (value) =>
        /\d/.test(value) || 'Must contain a number',
      hasUpperCase: (value) =>
        /[A-Z]/.test(value) || 'Must contain uppercase',
      hasSpecialChar: (value) =>
        /[!@#$%^&*]/.test(value) || 'Must contain special char'
    }
  })}
/>
```

### **Default vrednosti:**

```tsx
const { register } = useForm({
  defaultValues: {
    name: 'John Doe',
    email: 'john@example.com',
    subscribe: true
  }
});
```

### **Watch za reactive forms:**

```tsx
const { register, watch } = useForm();

const watchShowAge = watch('showAge', false);
const watchAllFields = watch();

return (
  <form>
    <input type="checkbox" {...register('showAge')} />
    {watchShowAge && <input {...register('age')} />}

    <pre>{JSON.stringify(watchAllFields, null, 2)}</pre>
  </form>
);
```

### **Primena u tvom Login.tsx:**

```tsx
// Trenutno: 50+ linija
// Sa React Hook Form: 20 linija

import { useForm } from 'react-hook-form';

function Login({ onLogin }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [apiError, setApiError] = useState('');

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const result = await authAPI.login(data.username, data.password);
      onLogin(result.access, result.refresh);
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Login error');
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {apiError && <Alert variant="danger">{apiError}</Alert>}

      <Form.Group>
        <Form.Label>Username</Form.Label>
        <Form.Control
          {...register('username', { required: 'Username is required' })}
          isInvalid={!!errors.username}
        />
        <Form.Control.Feedback type="invalid">
          {errors.username?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group>
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          {...register('password', { required: 'Password is required' })}
          isInvalid={!!errors.password}
        />
        <Form.Control.Feedback type="invalid">
          {errors.password?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </Button>
    </Form>
  );
}
```

**Resursi:**
- [React Hook Form Docs](https://react-hook-form.com/)

---

## 🎯 Plan za Dalje - Preporuke

### **Faza 1: Završi osnovni React (sada)**
✅ Lekcija 8: Conditional Rendering i Liste

### **Faza 2: Refaktorisanje projekta (naredna nedelja)**
1. **Implementiraj Context API** za autentifikaciju
2. **Dodaj Custom Hooks** (`useApi`, `useAuth`)
3. **Dodaj Error Boundaries**
4. **Implementiraj Code Splitting**

### **Faza 3: Unapredi projekat (naredne 2 nedelje)**
5. **Integriši React Query** - game changer!
6. **Integriši React Hook Form**
7. **Dodaj Performance optimizacije** (memo, useMemo)
8. **Napiši testove** (React Testing Library)

### **Faza 4: Novi projekat sa Next.js**
- Server-side rendering
- API routes
- File-based routing
- Image optimization
- Production-ready setup

---

## 📚 Dodatni Resursi

### **Dokumentacija:**
- [React Official Docs](https://react.dev) - OBAVEZNO!
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)

### **Video kursevi:**
- [Frontend Masters - React Path](https://frontendmasters.com/learn/react/)
- [Scrimba - React Course](https://scrimba.com/learn/learnreact)

### **Practice:**
- [React Challenges](https://github.com/alexgurr/react-coding-challenges)
- [Frontend Mentor](https://www.frontendmentor.io/)

### **Code Examples:**
- [React Patterns](https://reactpatterns.com/)
- [Awesome React](https://github.com/enaqx/awesome-react)

---

**Datum kreiranja bonus lekcija:** 2025-10-20
**Status:** Spremno za učenje nakon Lekcije 8
