"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { InfoBanner } from "@/components/ui/info-banner";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { registerProfessional } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  getCities,
  getCountries,
  getEthnicities,
  getGenders,
  getHairColors,
  getStates,
} from "@/lib/api/reference";
import type { GenderResponse, ReferenceItemResponse } from "@/lib/api/types";
import { persistAuthSession } from "@/lib/auth/session";
import styles from "./professional-signup-screen.module.css";

const stackedCards = [
  { src: "/stacked_cards_1.png", alt: "Modelo em destaque com fundo escuro e luz suave" },
  { src: "/stacked_cards_2.png", alt: "Modelo em destaque com composição premium e contraste dramático" },
  { src: "/stacked_cards_3.png", alt: "Modelo em destaque com pose elegante e acabamento refinado" },
];

const cardPlacements = [
  { x: 0, y: 0, scale: 1, rotate: -1.5, zIndex: 3 },
  { x: 72, y: 28, scale: 0.93, rotate: 8, zIndex: 2 },
  { x: -64, y: 46, scale: 0.86, rotate: -11, zIndex: 1 },
];

type ToastState = { title: string; message: string; type: "success" | "error" | "info" } | null;

function toSelectOptions(items: ReferenceItemResponse[]) {
  return items.map((item) => ({ value: String(item.id), label: item.name }));
}

function toGenderOptions(items: GenderResponse[]) {
  return items.map((item) => ({ value: String(item.id), label: item.clientViewName || item.name }));
}

export function ProfessionalSignupScreen() {
  const router = useRouter();
  const iconClassName = "h-4 w-4";

  const [step, setStep] = useState(1);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const [cpf, setCpf] = useState("");
  const [civilName, setCivilName] = useState("");
  const [stageName, setStageName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [heightCm, setHeightCm] = useState("");
  const [genderId, setGenderId] = useState("");
  const [ethnicityId, setEthnicityId] = useState("");
  const [hairColorId, setHairColorId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [bio, setBio] = useState("");
  const [bankData, setBankData] = useState("");
  const [identityState, setIdentityState] = useState("pending");

  const [genders, setGenders] = useState<GenderResponse[]>([]);
  const [countries, setCountries] = useState<ReferenceItemResponse[]>([]);
  const [states, setStates] = useState<ReferenceItemResponse[]>([]);
  const [cities, setCities] = useState<ReferenceItemResponse[]>([]);
  const [ethnicities, setEthnicities] = useState<ReferenceItemResponse[]>([]);
  const [hairColors, setHairColors] = useState<ReferenceItemResponse[]>([]);
  const [referencesLoading, setReferencesLoading] = useState(true);

  const showToast = (payload: NonNullable<ToastState>) => {
    setToast(payload);
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const intervalId = window.setInterval(() => {
      setActiveCardIndex((currentIndex) => (currentIndex + 1) % stackedCards.length);
    }, 4200);
    return () => window.clearInterval(intervalId);
  }, [prefersReducedMotion]);

  useEffect(() => {
    let active = true;

    const loadBaseReferences = async () => {
      setReferencesLoading(true);
      try {
        const [countriesResponse, gendersResponse, ethnicitiesResponse, hairColorsResponse] = await Promise.all([
          getCountries(),
          getGenders(),
          getEthnicities(),
          getHairColors(),
        ]);

        if (!active) return;

        setCountries(countriesResponse);
        setGenders(gendersResponse);
        setEthnicities(ethnicitiesResponse);
        setHairColors(hairColorsResponse);

        if (countriesResponse.length > 0) {
          setCountryId(String(countriesResponse[0].id));
        }
      } catch (error) {
        if (!active) return;
        const message = error instanceof ApiError ? error.message : "Nao foi possivel carregar referencias agora.";
        showToast({ title: "Falha ao carregar dados", message, type: "error" });
      } finally {
        if (active) setReferencesLoading(false);
      }
    };

    loadBaseReferences();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!countryId) {
      setStates([]);
      return;
    }

    let active = true;

    getStates(countryId)
      .then((response) => {
        if (!active) return;
        setStates(response);
        setStateId(response.length > 0 ? String(response[0].id) : "");
      })
      .catch(() => {
        if (!active) return;
        setStates([]);
        setStateId("");
      });

    return () => {
      active = false;
    };
  }, [countryId]);

  useEffect(() => {
    let active = true;
    const selectedState = stateId || undefined;

    getCities(selectedState)
      .then((response) => {
        if (!active) return;
        setCities(response);
        setCityId((current) => (current ? current : response.length > 0 ? String(response[0].id) : ""));
      })
      .catch(() => {
        if (!active) return;
        setCities([]);
      });

    return () => {
      active = false;
    };
  }, [stateId]);

  const genderOptions = useMemo(() => toGenderOptions(genders), [genders]);
  const countryOptions = useMemo(() => toSelectOptions(countries), [countries]);
  const stateOptions = useMemo(() => toSelectOptions(states), [states]);
  const cityOptions = useMemo(() => toSelectOptions(cities), [cities]);
  const ethnicityOptions = useMemo(() => toSelectOptions(ethnicities), [ethnicities]);
  const hairColorOptions = useMemo(() => toSelectOptions(hairColors), [hairColors]);

  const validateStepOne = () => {
    const cpfDigits = cpf.replace(/\D/g, "");
    const normalizedEmail = email.trim().toLowerCase();

    if (cpfDigits.length !== 11 || civilName.trim().length < 3) {
      showToast({
        title: "Dados civis incompletos",
        message: "Preencha CPF valido e nome civil para continuar.",
        type: "error",
      });
      return false;
    }

    if (!normalizedEmail || !password || password.length < 6) {
      showToast({
        title: "Credenciais invalidas",
        message: "Informe um e-mail valido e senha com ao menos 6 caracteres.",
        type: "error",
      });
      return false;
    }

    if (password !== confirmPassword) {
      showToast({
        title: "Senhas diferentes",
        message: "A confirmacao de senha precisa ser igual a senha principal.",
        type: "error",
      });
      return false;
    }

    return true;
  };

  const validateStepTwo = () => {
    const parsedHeight = Number(heightCm);
    if (!genderId || Number.isNaN(parsedHeight) || parsedHeight < 120 || parsedHeight > 230) {
      showToast({
        title: "Dados complementares invalidos",
        message: "Informe genero e altura valida para concluir o cadastro.",
        type: "error",
      });
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStepOne()) return;
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async () => {
    if (!validateStepTwo()) return;

    setLoading(true);
    try {
      const auth = await registerProfessional({
        email: email.trim().toLowerCase(),
        password,
        genderId: Number(genderId),
        heightCm: Number(heightCm),
        stageName: stageName.trim() || null,
        bio: bio.trim() || null,
        publicPhone: phone.trim() || null,
        ethnicityId: ethnicityId ? Number(ethnicityId) : null,
        hairColorId: hairColorId ? Number(hairColorId) : null,
        cityId: cityId ? Number(cityId) : null,
      });

      persistAuthSession(auth);
      showToast({
        title: "Cadastro concluido",
        message: "Perfil profissional criado com sucesso.",
        type: "success",
      });
      router.push("/profissional/dashboard");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Nao foi possivel finalizar o cadastro agora.";
      showToast({
        title: "Falha no cadastro",
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 md:grid md:grid-cols-2 md:items-start">
      <section className={`relative w-full overflow-hidden md:sticky md:top-0 md:h-screen ${styles.heroPane}`}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid}>
          <div className={styles.heroStack} aria-label="Mosaico de fotos das modelos">
            <div className={styles.stageFrame}>
              {stackedCards.map((card, index) => {
                const slotIndex = (index - activeCardIndex + stackedCards.length) % stackedCards.length;
                const placement = cardPlacements[slotIndex];

                return (
                  <div
                    key={card.src}
                    className={styles.stackCard}
                    data-layer={slotIndex === 0 ? "front" : slotIndex === 1 ? "middle" : "back"}
                    style={{
                      transform: `translate3d(${placement.x}px, ${placement.y}px, 0) scale(${placement.scale}) rotate(${placement.rotate}deg)`,
                      zIndex: placement.zIndex,
                    }}
                  >
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      priority={slotIndex === 0}
                      quality={100}
                      className={styles.stackImage}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className={styles.stackOverlay} />
                  </div>
                );
              })}

              <div className={styles.heroCopy}>
                <p className={styles.heroEyebrow}>Executive profile</p>
                <h2 className={styles.heroTitle}>Curadoria de Elite</h2>
                <p className={styles.heroDescription}>
                  Cadastro profissional com verificacao e publicacao assistida para manter o padrao de seguranca da plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:flex md:min-h-screen md:items-center md:justify-center md:px-10">
        <div className="mx-auto w-full max-w-md space-y-6">
          <header>
            <div className="flex items-center gap-2">
              <BackButton />
              <Link href="/" className="font-display text-2xl text-wine-800">
                Sigillus
              </Link>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-zinc-900">Criar conta profissional</h1>
            <p className="mt-1 text-base text-zinc-700">
              Passo {step} de 2: {step === 1 ? "Dados basicos e acesso" : "Dados complementares"}
            </p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
              <div className={`h-full bg-wine-800 transition-all duration-300 ease-in-out ${step === 1 ? "w-1/2" : "w-full"}`} />
            </div>
          </header>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-300/40 md:p-6">
            <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
              {step === 1 ? (
                <div className="space-y-4">
                  <Input
                    id="cpf"
                    label="CPF"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(event) => setCpf(event.target.value)}
                    premium
                    leadingIcon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClassName}>
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M8 8h8" />
                        <path d="M8 12h5" />
                      </svg>
                    }
                  />

                  <Input
                    id="civil-name"
                    label="Nome civil"
                    placeholder="Nome completo conforme documento"
                    value={civilName}
                    onChange={(event) => setCivilName(event.target.value)}
                    premium
                  />

                  <Input
                    id="stage-name"
                    label="Nome artistico"
                    placeholder="Como deseja aparecer no perfil"
                    value={stageName}
                    onChange={(event) => setStageName(event.target.value)}
                    premium
                  />

                  <Input
                    id="phone"
                    label="Telefone publico"
                    placeholder="+55 (00) 00000-0000"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    premium
                  />

                  <Input
                    id="email"
                    label="E-mail"
                    type="email"
                    placeholder="voce@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    premium
                  />

                  <Input
                    id="password"
                    label="Senha"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    premium
                  />

                  <Input
                    id="confirm-password"
                    label="Confirmar senha"
                    type="password"
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    premium
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <Select
                    id="gender"
                    label="Genero"
                    value={genderId}
                    onChange={(event) => setGenderId(event.target.value)}
                    options={[{ value: "", label: referencesLoading ? "Carregando..." : "Selecione" }, ...genderOptions]}
                    premium
                  />

                  <Input
                    id="height"
                    label="Altura (cm)"
                    type="number"
                    min={120}
                    max={230}
                    placeholder="170"
                    value={heightCm}
                    onChange={(event) => setHeightCm(event.target.value)}
                    premium
                  />

                  <Select
                    id="ethnicity"
                    label="Etnia"
                    value={ethnicityId}
                    onChange={(event) => setEthnicityId(event.target.value)}
                    options={[{ value: "", label: "Nao informar" }, ...ethnicityOptions]}
                    premium
                  />

                  <Select
                    id="hair-color"
                    label="Cor de cabelo"
                    value={hairColorId}
                    onChange={(event) => setHairColorId(event.target.value)}
                    options={[{ value: "", label: "Nao informar" }, ...hairColorOptions]}
                    premium
                  />

                  <Select
                    id="country"
                    label="Pais"
                    value={countryId}
                    onChange={(event) => setCountryId(event.target.value)}
                    options={[{ value: "", label: "Selecione" }, ...countryOptions]}
                    premium
                  />

                  <Select
                    id="state"
                    label="Estado"
                    value={stateId}
                    onChange={(event) => setStateId(event.target.value)}
                    options={[{ value: "", label: "Selecione" }, ...stateOptions]}
                    premium
                  />

                  <Select
                    id="city"
                    label="Cidade"
                    value={cityId}
                    onChange={(event) => setCityId(event.target.value)}
                    options={[{ value: "", label: "Selecione" }, ...cityOptions]}
                    premium
                  />

                  <Input
                    id="bio"
                    label="Descricao do perfil"
                    placeholder="Breve apresentacao para seu anuncio"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    premium
                  />

                  <Input
                    id="bank"
                    label="Dados bancarios"
                    placeholder="Banco, agencia e conta"
                    value={bankData}
                    onChange={(event) => setBankData(event.target.value)}
                    premium
                  />

                  <Select
                    id="identity"
                    label="Reconhecimento facial / identidade"
                    value={identityState}
                    onChange={(event) => setIdentityState(event.target.value)}
                    options={[
                      { value: "pending", label: "Enviar selfie + documento" },
                      { value: "started", label: "Verificacao iniciada" },
                    ]}
                    premium
                  />

                  <InfoBanner
                    title="Verificacao de identidade"
                    description="Os dados de verificacao seguem no fluxo da plataforma para validacao final do perfil."
                    tone="secure"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step === 2 ? (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={prevStep}
                      disabled={loading}
                      className="w-1/3 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-2/3"
                    >
                      {loading ? "Finalizando..." : "Criar conta profissional"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" fullWidth onClick={nextStep} disabled={loading}>
                    Continuar
                  </Button>
                )}
              </div>
            </form>

            {toast ? (
              <div className="mt-4">
                <Toast title={toast.title} message={toast.message} type={toast.type} />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
