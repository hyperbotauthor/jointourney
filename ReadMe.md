# jointourney

Join upcoming lichess tourneys automatically of a certain variant.

## Usage

```bash
# only necessary for the first time to install node modules, you can omit this later
yarn install

# run script for joining tourneys
node tourney.js
```

### Environment variables

#### LICHESS_TOURNEY_TOKEN

Required.

Lichess API access token with tourney scope.

#### TOURNEY_VARIANT

Optional. Default is `atomic`.

Variant key of tourney to join.