import i18n from '@/src/i18n';
import {
  fromBirthDateISO, maskBirthDate, maskName, maskTelephone, passwordStrength, toBirthDateISO,
  validateBirthDate, validateCountry, validateEmail, validateName, validatePassword,
  validateProfileForm, validateRegisterForm, validateTelephone,
} from '@/utils/validators';

const t = (key: string, opts?: Record<string, unknown>) => i18n.t(key, opts);

describe('mascaras de formulario', () => {
  it('remove numeros e simbolos do nome', () => {
    expect(maskName('Ana123 Clara!')).toBe('Ana Clara');
  });

  it('formata a data de nascimento enquanto o usuario digita', () => {
    expect(maskBirthDate('1')).toBe('1');
    expect(maskBirthDate('105')).toBe('10/5');
    expect(maskBirthDate('10051998')).toBe('10/05/1998');
  });

  it('formata telefone fixo e celular', () => {
    expect(maskTelephone('41')).toBe('41');
    expect(maskTelephone('4199')).toBe('(41) 99');
    expect(maskTelephone('4133334444')).toBe('(41) 3333-4444');
    expect(maskTelephone('41999998888')).toBe('(41) 99999-8888');
  });

  it('converte a data entre o formato da tela e o do backend', () => {
    expect(toBirthDateISO('10/05/1998')).toBe('1998-05-10');
    expect(fromBirthDateISO('1998-05-10')).toBe('10/05/1998');
  });
});

describe('validacoes', () => {
  it('nome obrigatorio e com pelo menos 2 letras', () => {
    expect(validateName(' ', 'firstName')).toBe(t('validation:name.required', { field: t('validation:fields.firstName') }));
    expect(validateName('A', 'lastName')).toBe(t('validation:name.minLength', { field: t('validation:fields.lastName') }));
    expect(validateName('Ana', 'firstName')).toBeNull();
  });

  it('data de nascimento: formato, data real e idade', () => {
    expect(validateBirthDate('')).toBe(t('validation:birthDate.required'));
    expect(validateBirthDate('10/05')).toBe(t('validation:birthDate.invalidFormat'));
    expect(validateBirthDate('40/05/1998')).toBe(t('validation:birthDate.invalid'));
    expect(validateBirthDate('31/02/1998')).toBe(t('validation:birthDate.invalid'));
    const recente = new Date().getFullYear() - 5;
    expect(validateBirthDate(`01/01/${recente}`)).toBe(t('validation:birthDate.underage'));
    expect(validateBirthDate('10/05/1998')).toBeNull();
  });

  it('telefone com 10 ou 11 digitos', () => {
    expect(validateTelephone('')).toBe(t('validation:telephone.required'));
    expect(validateTelephone('(41) 999')).toBe(t('validation:telephone.invalid'));
    expect(validateTelephone('(41) 99999-8888')).toBeNull();
  });

  it('e-mail obrigatorio e valido', () => {
    expect(validateEmail('')).toBe(t('validation:email.required'));
    expect(validateEmail('ana@')).toBe(t('validation:email.invalid'));
    expect(validateEmail('ana@trajetto.com')).toBeNull();
  });

  it('pais obrigatorio', () => {
    expect(validateCountry('')).toBe(t('validation:country.required'));
    expect(validateCountry('Brasil')).toBeNull();
  });

  it('senha forte: tamanho, maiuscula, minuscula, numero e simbolo', () => {
    expect(validatePassword('')).toBe(t('validation:password.required'));
    expect(validatePassword('Ab1!')).toBe(t('validation:password.minLength'));
    expect(validatePassword('abcdefg1!')).toBe(t('validation:password.uppercase'));
    expect(validatePassword('ABCDEFG1!')).toBe(t('validation:password.lowercase'));
    expect(validatePassword('Abcdefgh!')).toBe(t('validation:password.number'));
    expect(validatePassword('Abcdefg12')).toBe(t('validation:password.special'));
    expect(validatePassword('Abcdef1!')).toBeNull();
    expect(passwordStrength('Abcdef1!')).toEqual({ length: true, uppercase: true, lowercase: true, number: true, special: true });
  });

  it('formularios completos so devolvem os campos com erro', () => {
    const valido = {
      firstName: 'Ana', lastName: 'Souza', birthDate: '10/05/1998', telephone: '41999998888',
      email: 'ana@trajetto.com', country: 'Brasil', password: 'Abcdef1!',
    };
    expect(validateRegisterForm(valido)).toEqual({});
    expect(Object.keys(validateRegisterForm({ ...valido, email: 'x', password: '' }))).toEqual(['email', 'password']);
    expect(validateProfileForm({ ...valido, country: '' })).toEqual({ country: t('validation:country.required') });
  });
});
