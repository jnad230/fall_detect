# Fall Detection Project
## Juveriya Nadaf 25 February 2026

One in four people above the age of 65 have a fall each year in the US[1]. A study estimates that  80% of those who had a fall were unable to get up after atleast one fall[2]. 

Such undetected lies increase the risk of pressure injuries, rhabdomyolysis, hypothermia, dehydration and pneumonia. Undetected falls are a leading cause of rhabdomyolysis, with 57.7% cases (out of 343) suffering acute renal failure[3]. Additionally, it can lead to a significant delay of caring for urgent conditions like a stroke or a cardiovascular emergency leading to severe long term consequences. Not to mention the severe psychological trauma caused by the helplessness of not being able to get up from a fall until someone is coincidentally summoned. 

A wearable device that alerts the primary caregiver of an elderly person about an indicent, is a promising solution to reducing the time between a fall and caregiver response. Wu et al. (2015) describes a waist mounted system for fall detection[4]. Their work served as the main source of algorithmic inspiration and theoretical foundation for this project. 

Fall Detect monitors and alerts the caregiver of the user through SMS in the event of a fall. It also guides the caregiver through a checklist if a fall has occured, based on the NSW Fall Prevention Program CEC Post Fall Guide. 

This version of the app is an initial prototype due to time being a constraint (3 days). The challenges faced during development are listed below as requested.

1. Hardware acquisition 
It was difficult to acquire a good quality sensor within the limited time of 3 days. Additionally, creating a waist bound wearable prototype would've taken up more time leading to further delays. 

My options were to get an Arduino with an MPU-6050 for this project, or leverage the sensors I already had sitting in my pocket i.e my phone. 

In order to preserve the timeline of the project, I chose to use my phone's IMU as it already has a solid accelerometer and gyroscope built within it. 

2. Local HTTPS requirement
In order for Safari to grant access to the Motion API, it requires a secure HTTPS connection. This was initially difficult to troubleshoot as Safari was silently blocking the request. It required me to research and read into the problem from all open ends to figure out what factors could be affecting this access. 

My options after diagnosing the issue were
  - Using NGROK as a quick solution.
  - Using a self signed certificate 
  - Using mkcert to generate a local certificate 

NGROK although quick and easy, came with limited number of HTTPS requests under the free trial. Since I was constantly reading accelerometer data, I didn't want to be limited by the paywall. A self signed certificate would have been quick too, but not the cleanest method. Safari could've continued to deny access even with a self signed certificate.

After weighing my options, and in the interest of money and time, I decided to generate a certificate using mkcert. A reliable guide by Maud Nalpas (https://web.dev/articles/how-to-use-local-https) helped me strengthen my decision further and offered a clean implementation.

3. Rotation Detection
The paper I referred to for algorithmic implementation talks about using quaternions to describe rotation movement in a human’s gait change which also includes falling. To access quaternion attitude on an iPhone, I would have needed to develop a native app to use core motion. 

My options were to use existing apps that would help me access this data with ease. But I also realised that the algorithm only required rotation and acceleration values which I could get through a browser app as well.

In order to make sure the complexity of the project was not compromised through the use of an existing app and the project meets its timelines, I struck a balance using raw access values through the browser platform. 

Bonus Challenge: Falling again and again for testing purposes.

References:
1. Giovannini, S. et al.  (2022). Falls among Older Adults: Screening, Identification, Rehabilitation, and Management. Applied Sciences, 12(15), 7934. https://www.mdpi.com/2076-3417/12/15/7934

2. Fleming, J. et al. (2008). Inability to get up after falling, subsequent time on floor, and summoning help. BMJ, 337, a2227. https://pmc.ncbi.nlm.nih.gov/articles/PMC2590903/

3. Morin, A.G., Somme, D., & Corvol, A. (2024). Rhabdomyolysis in older adults: outcomes and prognostic factors. BMC Geriatrics, 24, 51. https://link.springer.com/article/10.1186/s12877-023-04620-8

4. Wu, F., Zhao, H., Zhao, Y., & Zhong, H. (2015). Development of a Wearable-Sensor-Based Fall Detection System. International Journal of Telemedicine and Applications, 2015, Article 576364. https://doi.org/10.1155/2015/576364
