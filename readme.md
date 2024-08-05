## Purpose
Sort and group import statements in local files to make the file headers look cleaner.

###  Example
> If you have the following imports:
```javascript
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { App } from './App';
import { config } from './config';
import './styles.css';
import { fetchData } from './api';
import { useState } from 'react';
import { Button } from '@material-ui/core';
```

You can format them using:

```shell
npm i nice-import -g
nice-import src/index.js
# or
ni src/index.js
```
Resulting in:

```javascript
import React from 'react';
import { useState } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import { Button } from '@material-ui/core';

import { App } from './App';
import { config } from './config';
import { fetchData } from './api';

import './styles.css';
```

### Formatting Rules
1. Each group is arranged in a triangular shape.
2. There are 4 groups:
   - Third-party libraries
   - Scoped packages (with @ symbol)
   - Local files
   - Styles
3. There is a blank line between each group.

