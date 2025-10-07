require('dotenv/config');
const { LookerNodeSDK } = require('@looker/sdk-node');

const lookerBaseUrl = process.env.LOOKERSDK_BASE_URL;
const sdk = LookerNodeSDK.init40();

async function getPollingAgeValuesFromExplore() {
  try {
    const query = await sdk.run_inline_query({
      result_format: 'json_detail',
      body: {
        model: 'govuk',
        view: 'polling_question_response_selections',
        fields: ['polling_survey_responses.age_group'],
        sort: ['polling_survey_responses.age_group'],
        total: false
      }
    });

    if (query.ok) {
      return query.value.data;
    } else {
      console.error('Could not get user info', response.error);
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  } finally {
    await sdk.authSession.logout();
  }
}

async function getPollingSeriesFromExplore(filterAgeValue = '') {
  try {
    if (filterAgeValue) {
      filter = {'polling_survey_responses.age_group': filterAgeValue}
    } else {
      filter = {}
    }
    const query = await sdk.run_inline_query({
      result_format: 'json_detail',
      body: {
        model: 'govuk',
        view: 'polling_question_response_selections',
        fields: ['polling_survey_waves.start_quarter', 'polling_survey_responses.count_survey_responses'],
        sort: ['polling_survey_waves.start_quarter asc'],
        filters: filter,
        total: false
      }
    });

    if (query.ok) {
      const data = query.value.data;
      
      data.sort((a, b) => {
        const ageGroupA = a['polling_survey_waves.start_quarter'].value;
        const ageGroupB = b['polling_survey_waves.start_quarter'].value;
        return ageGroupA.localeCompare(ageGroupB);
      });

      return data;
    } else {
      console.error('Could not get user info', response.error);
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  } finally {
    await sdk.authSession.logout();
  }
}

async function getGA4MetricFromExplore(looker_date_filter) {
  try {
    const query = await sdk.run_inline_query({
      result_format: 'json_detail',
      body: {
        model: 'govuk',
        view: 'govuk',
        fields: ['govuk.sessions'],
        filters: { 'govuk.event_date': looker_date_filter},
        total: false
      }
    });

    if (query.ok) {
      return query.value.data[0];
    } else {
      console.error('Could not get user info', response.error);
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  } finally {
    await sdk.authSession.logout();
  }
}

async function getGA4MetricFromExploreLast30Days() {
  return await getGA4MetricFromExplore('31 days ago for 30 days')
}

async function getGA4MetricFromExploreLast30DaysPreviousPeriod() {
  return await getGA4MetricFromExplore('61 days ago for 30 days')
}

async function getGA4SeriesFromExplore(looker_date_filter) {
  try {
    const query = await sdk.run_inline_query({
      result_format: 'json_detail',
      body: {
        model: 'govuk',
        view: 'govuk',
        fields: ['govuk.sessions', 'govuk.event_date'],
        sort: ['govuk.event_date desc'],
        filters: { 'govuk.event_date': looker_date_filter},
        total: false
      }
    });

    if (query.ok) {
      return query.value.data;
    } else {
      console.error('Could not get user info', response.error);
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  } finally {
    await sdk.authSession.logout();
  }
}

/**
 * Generates a secure, signed URL for embedding a Look.
 * @param {string} lookerBaseUrl - The url of the Looker instance.
 * @param {string} lookId - The ID of the Look to embed.
 * @returns {Promise<string|null>} The signed URL or null if an error occurs.
 */
async function generateEmbedUrlForLook(lookerBaseUrl) {
  try {
    const targetUrl = `${lookerBaseUrl}/embed/looks/2`;

    const signedUrl = await sdk.create_embed_url_as_me({
      target_url: targetUrl,
      session_length: 600
    });

    if (signedUrl && signedUrl.ok) {
      return signedUrl.value.url;
    } else {
      console.error("Looker SDK failed to create signed URL", signedUrl.error);
      return null;
    }

  } catch (error) {
    console.error("Error generating Looker embed URL in looker.js", error);
    return null;
  }
}

module.exports = {
  getGA4MetricFromExploreLast30Days,
  getGA4MetricFromExploreLast30DaysPreviousPeriod,
  getGA4SeriesFromExplore,
  getPollingSeriesFromExplore,
  getPollingAgeValuesFromExplore,
  generateEmbedUrlForLook,
  lookerBaseUrl,
}
