import { useEffect, useCallback, useRef } from "react";
import { LexicalEditor, $getNodeByKey } from "lexical";
import { FetchStatus, LinkPreviewAPIResponse } from "../types/linkNodeTypes";
import { $isCustomLinkNode } from "../linkNode";

interface UseLinkPreviewFetchParams {
  nodeKey: string;
  editor: LexicalEditor;
  fetchStatus: FetchStatus;
  href: string;
}

interface UseLinkPreviewFetchReturn {
  refetch: () => void;
}

export function useLinkPreviewFetch({
  nodeKey,
  editor,
  fetchStatus,
  href,
}: UseLinkPreviewFetchParams): UseLinkPreviewFetchReturn {
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasFetchedRef = useRef(false);
  const hrefRef = useRef(href);
  hrefRef.current = href;

  const doFetch = useCallback(
    (url: string) => {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Set status to LOADING
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (!$isCustomLinkNode(node)) return;
        node.setFetchStatus(FetchStatus.LOADING);
      });

      const encodedUrl = encodeURIComponent(url);

      fetch(`/api/link-preview?url=${encodedUrl}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.json() as Promise<LinkPreviewAPIResponse>;
        })
        .then((data) => {
          if (controller.signal.aborted) return;

          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (!$isCustomLinkNode(node)) return;

            node.setPreviewMetadata({
              title: data.title,
              description: data.description,
              favicon: data.favicon,
              image: data.image,
              domain: data.domain,
            });
            node.setFetchStatus(FetchStatus.SUCCESS);
            node.setFetchTimestamp(Date.now());
          });
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === "AbortError") return;

          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (!$isCustomLinkNode(node)) return;
            node.setFetchStatus(FetchStatus.ERROR);
          });
        });
    },
    [editor, nodeKey]
  );

  // Trigger fetch once when fetchStatus is IDLE
  // Using a ref to avoid re-running when fetchStatus prop changes due to our own update
  useEffect(() => {
    if (fetchStatus === FetchStatus.IDLE && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      doFetch(href);
    }
  }, [fetchStatus, href, doFetch]);

  // Reset hasFetchedRef when href changes (new URL needs new fetch)
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [href]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(() => {
    hasFetchedRef.current = true;
    doFetch(hrefRef.current);
  }, [doFetch]);

  return { refetch };
}
