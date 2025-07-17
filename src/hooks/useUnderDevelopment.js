import { useToast } from './use-toast'

export const useUnderDevelopment = () => {
    const { toast } = useToast()

    const showUnderDevelopmentMessage = (feature = 'This feature') => {
        toast({
            title: "Under Development",
            description: `${feature} is currently under development. Stay tuned for updates!`,
            duration: 3000,
        })
    }

    return { showUnderDevelopmentMessage }
}
