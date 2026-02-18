export const getAvatarUrl = (str: string): string => {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${str}`
}
