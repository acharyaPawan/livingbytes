import { type JournalType } from "@/app/(site)/(routes)/journal/page"
import ButtonWithRoute from "./ButtonWithRoute"

const JournalCardView = ({Journal}: {Journal:JournalType}) => {
  return (
    <>
    <ButtonWithRoute href="/journal/today">Got to Journal of date: {Journal.date.toLocaleDateString()}</ButtonWithRoute>
    </>
  )
}
export default JournalCardView