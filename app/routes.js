//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//
const govukPrototypeKit = require('govuk-prototype-kit')

const looker = require('./data/looker.js')

const router = govukPrototypeKit.requests.setupRouter()

router.get('/', function (req, res) {
  res.render('index', {
  })
})

router.get('/using-an-explore', async (req, res) => {
  try {
    const selectedAgeGroup = req.query['age-group'];

    const ga4MetricFromExploreLast30Days = await looker.getGA4MetricFromExploreLast30Days()
    const ga4MetricFromExploreLast30DaysPreviousPeriod = await looker.getGA4MetricFromExploreLast30DaysPreviousPeriod()
    const ga4SeriesFromExplore = await looker.getGA4SeriesFromExplore('last 8 days')
    const pollingSeriesFromExplore = await looker.getPollingSeriesFromExplore(selectedAgeGroup)
    const pollingAgeValuesFromExplore = await looker.getPollingAgeValuesFromExplore()

    res.render('using-an-explore', {
      ga4MetricFromExploreLast30Days: ga4MetricFromExploreLast30Days,
      ga4MetricFromExploreLast30DaysPreviousPeriod: ga4MetricFromExploreLast30DaysPreviousPeriod,
      ga4SeriesFromExplore: ga4SeriesFromExplore,
      pollingSeriesFromExplore: pollingSeriesFromExplore,
      pollingAgeValuesFromExplore: pollingAgeValuesFromExplore,
      currentPage: "using-an-explore",
    })
  } catch (error) {
    console.error('Error fetching data from API:', error)
    res.render('using-an-explore', {
      error: 'Sorry, there was a problem fetching the user data.',
      currentPage: "using-an-explore"
    })
  }
})

router.get('/using-a-look', async (req, res) => {
  try {
    res.render('using-a-look', {
      currentPage: "using-a-look",
    })
  } catch (error) {
    console.error('Error fetching data from API:', error)
    res.render('using-a-look', {
      error: 'Sorry, there was a problem fetching the user data.',
      currentPage: "using-a-look"
    })
  }
})

router.get('/embedding', async (req, res) => {
  try {
    res.render('embedding', {
      lookerHost: looker.lookerBaseUrl,
      currentPage: 'embedding'
    });

  } catch (error) {
    console.error("Route handler failed to get embed URL", error);
    res.render('embedding', {
      error: 'Could not load embedded Look.',
      currentPage: 'embedding'
    });
  }
});

router.get('/looker-auth', async (req, res) => {
  try {

    const signedUrl = await looker.generateEmbedUrlForLook(looker.lookerBaseUrl);

    res.json({ url: signedUrl });
  } catch (error) {
    console.error('Failed to create signed URL', error);
    res.status(500).send('Error creating signed URL.');
  }
});
