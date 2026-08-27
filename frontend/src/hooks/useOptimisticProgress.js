import { useCallback } from "react";
import { updateProgress } from "../api/progress";

// Given the setter for a problems array, returns a function that:
//  1. Applies the patch to local state immediately (no spinner, no flicker)
//  2. Sends the update to the server in the background
//  3. Only touches the network again (via `onError`) if the request fails
export function useOptimisticProgress(setProblems, onError) {
  return useCallback(
    (problemId, patch) => {
      setProblems((current) =>
        current.map((problem) =>
          problem._id === problemId
            ? { ...problem, progress: { ...(problem.progress || {}), ...patch } }
            : problem
        )
      );

      updateProgress(problemId, patch).catch((err) => {
        console.error("Failed to save progress:", err);
        onError?.(err);
      });
    },
    [setProblems, onError]
  );
}
