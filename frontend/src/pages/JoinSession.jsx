import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';  // React-router hooks
import { useMutation } from '@tanstack/react-query';

export default function JoinSession() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { isSignedIn, signIn } = useUser();  // Clerk-react hooks

  const requestMutation = useMutation({
    mutationFn: () => fetch(`/api/sessions/${id}/request`, { method: 'POST' }).then(r => r.json()),
    onSuccess: (data) => alert("Request Sent! Host reviewing—check back soon."),
    onError: (err) => alert("Join Failed: " + err.message),
  });

  useEffect(() => {
    if (!isSignedIn) {
      // Redirect to Clerk sign-in
      window.location.href = `/sign-in?redirect=/join/${id}&token=${token}`;
    }
  }, [isSignedIn, id, token]);

  if (!isSignedIn) return <div className="h-screen flex items-center justify-center">Redirecting to sign-in...</div>;

  return (
    <div className="h-screen flex items-center justify-center">
      <button onClick={() => requestMutation.mutate()} className="btn btn-primary">
        {requestMutation.isPending ? 'Sending Request...' : 'Request to Join Interview'}
      </button>
      {requestMutation.isSuccess && <p>Await host approval—refresh or check email.</p>}
    </div>
  );
}