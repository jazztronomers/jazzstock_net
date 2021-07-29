# @application.route('/getReportHK', methods=['GET'])
# def getReportFromHK():
#
#
#     rid = int(request.args.get('rid', 0))
#     member=_getMembership()
#
#     if member.get("membership") == 'supporter':
#
#         if os.isfile(os.path.join(path_pdf, rid)):
#
#
#
#         response = Response(
#             output_stream.getvalue(),
#             mimetype='application/pdf',
#             content_type='application/pdf',
#         )
#         response.headers["Content-Disposition"] = "attachment; filename=%s_%s.csv" % (filename_prefix, the_date)
#         return response
#
#     else:
#         return jsonify({'result': False, "message": alert_message['supporter_only_en']})
