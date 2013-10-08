<%@ Page Language="C#" %>
<%--
	Copyright: (c) 2009-2013 The Federal Tax Authority, LLC (FedTax). TaxCloud is a registered trademark of FedTax.
	This file contains Original Code and/or Modifications of Original Code as defined in, and that are subject to, the FedTax Public Source License (reference http://dev.taxcloud.net/ftpsl/ or http://taxcloud.net/ftpsl.pdf). 

	Support: Questions about this file should be directed to service@taxcloud.net.
	Documentation: https://taxloud.net/stripe/
	Author: John Milan (jmilan@fedtax.net)
	Revision: 1.0
	Released: 10/1/2013
--%>
<script runat="server">
private string forwardPost(string targetUrl, string soapAction, string data) {
    System.Net.HttpWebRequest request = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(targetUrl);
    request.Method = "POST";
    request.ContentType = "text/xml; charset=utf-8";
    request.ContentLength = data.Length;
    request.Accept = "text/xml";
    request.Headers["SOAPAction"] = soapAction;

    System.IO.StreamWriter sw = new System.IO.StreamWriter(request.GetRequestStream(), System.Text.Encoding.ASCII);
    sw.Write(data);
    sw.Close();

    System.IO.StreamReader sr = new System.IO.StreamReader(request.GetResponse().GetResponseStream());
    string result = sr.ReadToEnd();
    sr.Close();
    
    return result;
}

private void Page_Load(object sender, EventArgs e){
	// Put your TaxCloud API Login and API Key values here, along with the USPS User ID.
    string apiLoginID = "XXXXXXXX";// Get API ID from TaxCloud
    string apiKey = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX";	//Get API KEY from TaxCloud
    string uspsUserID = "XXXXXXXXXXXX";
    
    HttpContext.Current.Request.InputStream.Seek(0, System.IO.SeekOrigin.Begin);
    string rawPostData = new System.IO.StreamReader(HttpContext.Current.Request.InputStream).ReadToEnd();
    rawPostData = rawPostData.Replace("$apiLoginID", apiLoginID);
    rawPostData = rawPostData.Replace("$apiKey", apiKey);
    rawPostData = rawPostData.Replace("$uspsUserID", uspsUserID);

    string result = forwardPost(HttpContext.Current.Request.QueryString[0], HttpContext.Current.Request.Headers["SOAPAction"], rawPostData);

    HttpContext.Current.Response.Clear();
    HttpContext.Current.Response.Write(result);
    HttpContext.Current.Response.End();
}
</script> 
