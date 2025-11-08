'use client';

import { memo } from 'react';

const ThoughtItem = memo(({ thought }) => {
  return (
    <div className="thought-item">
      {thought}
    </div>
  );
});

ThoughtItem.displayName = 'ThoughtItem';

export default ThoughtItem;