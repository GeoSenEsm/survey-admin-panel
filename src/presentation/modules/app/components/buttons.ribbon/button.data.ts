export interface ButtonData{
    content: string,
    onClick: () => void,
    icon?: string
    disabled?: () => boolean
}