/**
 * Auth Signup Schema Validation Rules
 * API Schema: auth-signup-225747861
 */

export const authSignupSchema = {
  password: {
    name: '비밀번호',
    type: 'string',
    description: '영어 대/소문자, 숫자, 특수문자 포함 10자 이상',
    minLength: 10,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[\w!@#$%^&*]{10,}$/,
    validate: (value: string): boolean => {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[\w!@#$%^&*]{10,}$/.test(value);
    }
  },

  birthdate: {
    name: '생년월일',
    type: 'string',
    description: 'YYYY-MM-DD 형식',
    format: 'YYYY-MM-DD',
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    validate: (value: string): boolean => {
      // YYYY-MM-DD 형식 확인
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      
      const [year, month, day] = value.split('-').map(Number);
      
      // 유효한 날짜인지 확인
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }
  },

  nickname: {
    name: '닉네임',
    type: 'string',
    description: '2~8자',
    minLength: 2,
    maxLength: 8,
    validate: (value: string): boolean => {
      return value.length >= 2 && value.length <= 8;
    }
  },

  name: {
    name: '이름',
    type: 'string',
    description: '이름'
  },

  bio: {
    name: 'bio',
    type: 'string',
    description: '12자 이하',
    maxLength: 12,
    validate: (value: string): boolean => {
      return value.length <= 12;
    }
  },

  profileImage: {
    name: '프로필 이미지',
    type: 'string',
    description: '프로필 이미지 URL'
  },

  email: {
    name: '이메일',
    type: 'string',
    description: '이메일',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    validate: (value: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
  }
} as const;

// 개별 검증 함수
export const validatePassword = (password: string): boolean => {
  return authSignupSchema.password.validate(password);
};

export const validateBirthdate = (birthdate: string): boolean => {
  return authSignupSchema.birthdate.validate(birthdate);
};

export const validateNickname = (nickname: string): boolean => {
  return authSignupSchema.nickname.validate(nickname);
};

export const validateBio = (bio: string): boolean => {
  return authSignupSchema.bio.validate(bio);
};

export const validateEmail = (email: string): boolean => {
  return authSignupSchema.email.validate(email);
};

// 에러 메시지
export const validationMessages = {
  password: {
    invalid: '비밀번호는 영어 대/소문자, 숫자, 특수문자를 모두 포함하여 10자 이상이어야 합니다.'
  },
  birthdate: {
    invalid: '생년월일은 YYYY-MM-DD 형식이어야 합니다.'
  },
  nickname: {
    invalid: '닉네임은 2~8자여야 합니다.',
    duplicated: '이미 사용 중인 닉네임입니다.'
  },
  bio: {
    invalid: '소개는 12자 이하여야 합니다.'
  },
  email: {
    invalid: '올바른 이메일 형식이 아닙니다.',
    duplicated: '이미 존재하는 이메일입니다.'
  }
} as const;
