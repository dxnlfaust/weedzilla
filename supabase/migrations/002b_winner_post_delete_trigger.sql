-- ============================================================
-- Fix: When a winning post is deleted, promote the runner-up
-- or remove the winner entry if no runner-up has votes.
-- Also recalculates crown_count for affected users.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_winner_post_deleted()
RETURNS TRIGGER AS $$
DECLARE
  v_ww RECORD;
  v_runner_post_id UUID;
  v_runner_user_id UUID;
  v_runner_vote_count INTEGER;
BEGIN
  -- For each weekly winner that references the deleted post
  FOR v_ww IN
    SELECT id, week_year, species_id, user_id
    FROM public.weekly_winners
    WHERE post_id = OLD.id
  LOOP
    -- Find runner-up: next most-voted post for this week+species
    SELECT p.id, p.user_id, COUNT(v.id)::INTEGER
    INTO v_runner_post_id, v_runner_user_id, v_runner_vote_count
    FROM public.posts p
    LEFT JOIN public.votes v ON v.post_id = p.id
    WHERE p.species_id = v_ww.species_id
      AND p.week_year = v_ww.week_year
      AND p.id != OLD.id
      AND p.is_hidden = FALSE
      AND p.is_removed = FALSE
    GROUP BY p.id, p.user_id
    HAVING COUNT(v.id) > 0
    ORDER BY COUNT(v.id) DESC, p.created_at ASC
    LIMIT 1;

    IF v_runner_post_id IS NOT NULL THEN
      -- Promote runner-up to winner
      UPDATE public.weekly_winners
      SET post_id = v_runner_post_id,
          user_id = v_runner_user_id,
          vote_count = v_runner_vote_count
      WHERE id = v_ww.id;
    ELSE
      -- No runner-up with votes, remove winner entry
      DELETE FROM public.weekly_winners WHERE id = v_ww.id;
    END IF;

    -- Recalculate crown_count for old winner
    UPDATE public.profiles
    SET crown_count = (
      SELECT COUNT(*)::INTEGER FROM public.weekly_winners WHERE user_id = v_ww.user_id
    )
    WHERE id = v_ww.user_id;

    -- Recalculate crown_count for new winner (if different user)
    IF v_runner_user_id IS NOT NULL AND v_runner_user_id != v_ww.user_id THEN
      UPDATE public.profiles
      SET crown_count = (
        SELECT COUNT(*)::INTEGER FROM public.weekly_winners WHERE user_id = v_runner_user_id
      )
      WHERE id = v_runner_user_id;
    END IF;
  END LOOP;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- BEFORE DELETE so we can still query the post before it's gone
CREATE TRIGGER on_winner_post_deleted
  BEFORE DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION handle_winner_post_deleted();
