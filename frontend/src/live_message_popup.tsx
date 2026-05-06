
type LiveMessagePopupProps = {
  show: boolean
  message: string
}

export function LiveMessagePopup({
  show,
  message
}: LiveMessagePopupProps) {
  if (!show) return null

  return (
    <div className="liveMessageOverlay">
      <div>
        {message}
      </div>
    </div>
  )
}