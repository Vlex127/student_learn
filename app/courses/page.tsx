// app/courses/page.tsx
import { redirect } from "next/navigation";

export default function CoursesPage() {
  // Redirect to the user's courses page by default
  redirect("/my-courses");
}
