export const generateUserID = (): string => {
    const characters = '0123456789';
    let userID = '';
    for (let i = 0; i < 11; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      userID += characters.charAt(randomIndex);
    }
    return userID;
  };