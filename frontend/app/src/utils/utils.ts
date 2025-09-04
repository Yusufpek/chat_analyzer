
export const generateInitials = (
  firstName?: string,
  lastName?: string,
  username?: string
): string => {
  const trimmedFirstName = (firstName || '').trim();
  const trimmedLastName = (lastName || '').trim();
  
  if (trimmedFirstName || trimmedLastName) {
    return `${trimmedFirstName.charAt(0) || ''}${trimmedLastName.charAt(0) || ''}`.toUpperCase();
  }  
  if (username) {
    return username.slice(0, 2).toUpperCase();
  }
  return 'U';
};
